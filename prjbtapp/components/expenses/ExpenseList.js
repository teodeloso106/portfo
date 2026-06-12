/*
 * teodeloso@gmail.com
 *
 * Expenses list for User page budget
 */

'use client';

import { useState, useRef } from 'react';
import { getTotalExpenses, getRemainingBudget } from '@/utils/budget';
import Button from '@/components/ui/Button';

export default function ExpenseList({ expenses, totalBudget, setExpenses, setAppMessage }) {
  const totalExpenses = getTotalExpenses(expenses);

  const remaining = getRemainingBudget(totalBudget, expenses);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Track which specific row is currently "active/revealed" on mobile
  const [activeRowId, setActiveRowId] = useState(null);

  const timerStart = () => {
    setTimer(0);
    //tick every 1 sec
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const nextSec = prev + 1;
        setAppMessage("Accessing server... [ " + nextSec + " ] s"); 
      });
    }, 1000);
  };

  const timerStop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAppMessage("");
  };

  // Delete a user expense
  const deleteUserExpense = async (bttn, myId, myUserId) => {
    bttn.stopPropagation();

    let returnedData = null;
    setAppMessage("");
    timerStart();
    try {
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: myId,
          userId: myUserId
        }),
      });
      const responseData = await response.json();
      returnedData = responseData;
    } catch (error) {
      console.error("deleteUserExpense error:", error);
    } finally {
      timerStop();
    }
    
    // Display current expenses
    setExpenses((prevExpenses) => prevExpenses.filter((item) => item.id !== returnedData.id));
  };

  const formatAmt = (amt) => {
    const decimalAmt = parseFloat(amt);
    if (isNaN(decimalAmt)) return "";

    const formattedAmt = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(decimalAmt);

    return formattedAmt.padStart(10, " ");
  };

  //mobile hover functionality
  const handleRowClick = (id) => {
    // Check if we are on a touchscreen device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      if (activeRowId === id) {
        // If the row is already open, 
        // the second tap is for future updates
      } else {
        // First tap opens the button menu on mobile
        setActiveRowId(id);
      }
    } else {
      // Desktop mouse users for future updates
    }
  };

  return (
    <div className="w-full p-6 flex flex-col items-center justify-center text-gray-600  
          rounded-xl shadow">
      <div>
        <p className="font-mono whitespace-pre">{formatAmt(totalBudget)} → Budget</p>
        <p className="font-mono whitespace-pre">{formatAmt(totalExpenses)} → Spent</p>
        <p className="font-mono whitespace-pre">
          <span className={`font-mono whitespace-pre 
                ${remaining < 0 ? 'text-red-800' : 'text-green-800'} `}>
            {formatAmt(remaining)}
          </span>
          {" "}→ Balance
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-medium">Expenses</h3>
      </div>
      
      {/*
      <div className="w-full">
        <ul className="mx-auto">
          {expenses.map(e => (
            <li key={e.id} 
                className="group hover:bg-slate-300 hover:font-bold flex justify-between items-center p-1 rounded-lg">

              <div className="font-mono whitespace-pre">
                {formatAmt(e.budgetAmt)} → {e.budgetName}
              </div>
              
              <div>
                <Button className="invisible group-hover:visible group/btn relative text-gray-600 
                        bg-slate-300 px-3 py-2 rounded hover:cursor-pointer flex items-center justify-center"
                        onClick={(bttn) => deleteUserExpense(bttn, e.id, e.userId)}>
                  <img src="/delete.png" alt="" className="w-5 h-5 object-contain" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                        whitespace-nowrap rounded bg-slate-300 px-2 py-1 text-xs text-slate-800 opacity-0 
                        group-hover/btn:opacity-100 transition-opacity duration-150">
                    Delete
                  </span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      */}

      <div className="w-full">
        <ul className="mx-auto">
          {expenses.map(e => {
            const isRowRevealed = activeRowId === e.id;

            return (
              <li key={e.id} 
                  className={`group flex justify-between items-center p-1 rounded-lg 
                    ${isRowRevealed ? 'bg-slate-300' : 'hover:bg-slate-300 hover:font-bold'} `}
                    onClick={() => handleRowClick(e.id)}>

                <div className="font-mono whitespace-pre">
                  {formatAmt(e.budgetAmt)} → {e.budgetName}
                </div>
                
                <div>
                  <Button className={`
                          group/btn relative text-gray-600 bg-slate-300 px-3 py-2 rounded hover:cursor-pointer 
                          flex items-center justify-center transition-all 
                          ${isRowRevealed ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'} 
                          group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto `}
                          onClick={(bttn) => {
                            bttn.stopPropagation();
                            deleteUserExpense(bttn, e.id, e.userId);
                          }}>
                    <img src="/delete.png" alt="" className="w-5 h-5 object-contain" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                          whitespace-nowrap rounded bg-slate-300 px-2 py-1 text-xs text-slate-800 opacity-0 
                          group-hover/btn:opacity-100 transition-opacity duration-150">
                      Delete
                    </span>
                  </Button>
                </div>
              </li>
            );

          })}
        </ul>
      </div>

    </div>
  );
}
