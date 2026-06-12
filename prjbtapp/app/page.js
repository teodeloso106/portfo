/*
 * teodeloso@gmail.com
 *
 * Budget Tracker App landing page
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import {MAX_USERS} from '@/lib/constants';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const router = useRouter();
  const [appMessage, setAppMessage] = useState('');
  const [btnNewUserLabel, setBtnNewUserLabel] = useState('New User');
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
  
  // Fetch users on load
  useEffect(() => {
    timerStart();

    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
      .finally(timerStop);

    // cleanup incase of unmounts mid-request
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Create user
  const createUser = async () => {
    console.log("-- app/page.js [createUser]--");

    if ( !name.trim() || !budget.trim() ) {
      setAppMessage("An empty user name or budget not accepted.");
      return;
    }
    // filter number/decimal only
    const isOnlyNumbers = /^[0-9]+(\.[0-9]+)?$/.test(budget);
    if ( !isOnlyNumbers ) {
      setAppMessage("A non-valid budget not accepted");
      return;
    }

    let data = null;
    timerStart();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          userName: name,
          userBudgetTotalAmt: budget
        })
      });
      const resData = await res.json();
      data = resData;
    } catch (error) {
      console.error("createUser error:", error);
    } finally {
      timerStop();
    }
    
    /*  At some point, userService.js will return a MAX_USERS data
        so notify user if userId contains that data
    */
    if (Number(data.userId) === MAX_USERS) {
      setAppMessage("Up to [ " + data.userId + " ] users allowed only.");
    } else {
      setAppMessage("");
      router.push(`/user/${data.userId}`);
    }    
  };

  // Delete user
  const deleteUser = async (bttn, myUserId) => {
    bttn.stopPropagation();

    console.log("-- app/page.js [deleteUser]--");
    setAppMessage("");
    timerStart();

    let returnedData = null;
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        body: JSON.stringify({userId: myUserId})
      });
      const resData = await res.json();
      returnedData = resData;
    } catch (error) {
      console.error("deleteUser error:", error);
    } finally {
      timerStop();
    }
    
    //update current users
    setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== returnedData.userId));
  };
   
  const btnNewUserLabelOnClick = () => {
    setBtnNewUserLabel(btnNewUserLabel === "New User" ? "Clear Form" : "New User");
    setShowForm(!showForm);
    setName("");
    setBudget("");
    setAppMessage("");
  };

  const formatBudget = (userBudget) => {
    const decimalBudget = parseFloat(userBudget);
    if (isNaN(decimalBudget)) return "";

    const formattedBudget = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(decimalBudget);

    return formattedBudget.padStart(10, " ");
  };

  //mobile hover functionality
  const handleRowClick = (userId) => {
    // Check if we are on a touchscreen device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      if (activeRowId === userId) {
        // If the row is already open, the second tap routes to the page
        router.push(`/user/${userId}`);
      } else {
        // First tap opens the button menu on mobile
        setActiveRowId(userId);
      }
    } else {
      // Desktop mouse users route instantly on click
      router.push(`/user/${userId}`);
    }
  };

  return (<>
    <div className="h-20 flex flex-col items-center justify-center">
      {appMessage && (
        <p className="text-center p-3 text-slate-800 rounded-lg text-sm font-medium">
          {appMessage}
        </p>
      )}
    </div>

    <div className="flex flex-col items-center justify-center">
      
      <Button className="w-50 border mb-6 border-slate-800 text-slate-800 bg-slate-300 px-3 py-2 rounded 
              hover:cursor-pointer hover:font-medium hover:text-black transition"
              onClick={btnNewUserLabelOnClick}>
        {btnNewUserLabel}
      </Button>
      
      {showForm && (
        <div className="flex flex-col space-y-4 max-w-sm mx-auto p-6">
          <Input className="w-full border border-slate-800 bg-slate-300 text-gray-600 rounded-md p-2 text-sm"
             placeholder="your user name"
             value={name}
             onChange={e => setName(e.target.value)}
          />

          <Input className="w-full border border-slate-800 bg-slate-300 text-gray-600 rounded-md p-2 text-sm"
             placeholder="your budget"
             value={budget}
             onChange={e => setBudget(e.target.value)}
          />

          <Button className="border border-slate-800 text-slate-800 bg-slate-300 px-3 py-2 rounded 
                  hover:cursor-pointer hover:font-medium hover:text-black transition"
                  onClick={createUser}>
            Create
          </Button>
        </div>
      )}

      { /*
      <div className="w-full p-1 text-slate-800 bg-slate-400/40 rounded-xl shadow">
        <ul className="mx-auto">
          {users.map(user => (
            <li key={user.userId}
                className="group hover:bg-slate-400 flex justify-between items-center p-1 rounded-lg"
                onClick={() => router.push(`/user/${user.userId}`)}>

              <div className="font-mono whitespace-pre">
                {formatBudget(user.userBudgetTotalAmt)} → {user.userName} 
              </div>

              <div>
                <Button className="invisible group-hover:visible group/btn relative text-slate-800 
                      bg-slate-400 px-3 py-2 rounded hover:cursor-pointer flex items-center justify-center" 
                        onClick={(bttn) => deleteUser(bttn, user.userId)}>
                  <img src="/delete.png" alt="" className="w-5 h-5 object-contain" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                        whitespace-nowrap rounded bg-slate-400 px-2 py-1 text-xs text-slate-800 opacity-0 
                        group-hover/btn:opacity-100 transition-opacity duration-150">
                    Delete
                  </span>
                </Button>
              </div>

            </li>
          ))}
        </ul>
      </div>
      */ }

      <div className="w-full p-1 text-gray-600 rounded-xl shadow">
        <ul className="mx-auto">
          {users.map(user => {
            const isRowRevealed = activeRowId === user.userId;

            return (
              <li key={user.userId}
                  className={`group flex justify-between items-center p-1 rounded-lg 
                              ${isRowRevealed ? 'bg-slate-300' : 'hover:bg-slate-300 hover:font-bold'}`}
                  onClick={() => handleRowClick(user.userId)}>

                <div className="font-mono whitespace-pre">
                  {formatBudget(user.userBudgetTotalAmt)} → {user.userName} 
                </div>

                <div>
                  <Button className={`
                          group/btn relative text-gray-600 bg-slate-300 px-3 py-2 rounded hover:cursor-pointer flex 
                          items-center justify-center transition-all 
                          ${isRowRevealed ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'} 
                          group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto `}
                          onClick={(bttn) => {
                            bttn.stopPropagation();
                            deleteUser(bttn, user.userId);
                          }}>
                    <img src="/delete.png" alt="" className="w-5 h-5 object-contain" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                          whitespace-nowrap rounded bg-slate-300 px-2 py-1 text-xs text-gray-600 opacity-0 
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
  </>);
}
