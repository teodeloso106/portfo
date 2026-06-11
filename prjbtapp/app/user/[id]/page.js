/*
 * teodeloso@gmail.com
 *
 * User page budget details
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExpenseList from '@/components/expenses/ExpenseList';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {MAX_EXPENSES} from '@/lib/constants';

export default function UserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);

  const [name, setName] = useState('');
  const [amt, setAmt] = useState('');

  const [appMessage, setAppMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

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

  // Fetch user + expenses
  useEffect(() => {
    async function load() {
      setAppMessage("");
      timerStart();

      const users = await fetch('/api/users').then(r => r.json());
      const currentUser = users.find(u => u.userId === id);

      const exp = await fetch(`/api/expenses?userId=${id}`)
        .then(r => r.json()).finally(timerStop);

      setUser(currentUser);
      setExpenses(exp);
    }
    
    load();

    // cleanup incase of unmounts mid-request
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  // Add a user expense
  const addExpense = async () => {

    if ( !name.trim() || !amt.trim() ) {
      setAppMessage("An empty expense name or amount not accepted.");
      return;
    }
    // filter number/decimal only
    const isOnlyNumbers = /^[0-9]+(\.[0-9]+)?$/.test(amt);
    if ( !isOnlyNumbers ) {
      setAppMessage("A non-valid expense amount not accepted");
      return;
    }
    
    let data = null;
    timerStart();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userId: id,
          budgetName: name,
          budgetAmt: Number(amt)
        }),
      });
      const resData = await res.json();
      data = resData;
    } catch (error) {
      console.error("addExpense error:", error);
    } finally {
      timerStop();
    }

    /*  At some point, expenseService.js will return a MAX_EXPENSES 
        data so notify user if data.id contains that data
    */
    if (Number(data.id) === MAX_EXPENSES) {
     setAppMessage("Up to [ " + data.id + " ] expenses allowed only.");
    } else {
      //add the new expense to existing expenses
      setExpenses(prev => [
        ...prev,
        { id: data.id, userId: data.userId, budgetName: name, budgetAmt: amt }
      ]);

      setName("");
      setAmt("");
      setAppMessage("");
    }
  };

  if ( !user ) {
    return (
      <div className="h-20 flex flex-col items-center justify-center">
          <p className="text-center p-3 text-slate-800 rounded-lg text-sm font-medium">
            Loading...
          </p>
      </div>
    );
  }

  return (<>
    <div className="h-20 flex flex-col items-center justify-center">
      {appMessage && (
        <p className="text-center p-3 text-slate-800 rounded-lg text-sm font-medium">
          {appMessage}
        </p>
      )}
    </div>

    <div className="p-1 flex flex-col items-center justify-center">

      <div className="m-1 flex flex-col space-y-4 max-w-sm mx-auto">
        <Button className="w-20 group-hover:visible group/btn relative text-slate-800 px-3 py-2 hover:cursor-pointer  
                flex items-center justify-center bg-gray-400"
                onClick={() => router.push('/')}>
          <img src="/home.png" alt="" className="object-contain" />
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                          whitespace-nowrap rounded bg-slate-400 px-2 py-1 text-xs text-slate-800 opacity-0 
                          group-hover/btn:opacity-100 transition-opacity duration-150">
            Home
          </span>
        </Button>
      </div>

      <div className="m-1 flex flex-col max-w-sm mx-auto">
        <h2 className="text-xl font-bold mt-4 text-slate-800/50">
          {user.userName}
        </h2>
      </div>

      <div className="m-1 mt-0 flex flex-col space-y-2 max-w-sm mx-auto p-3">
        <Input className="w-50 border border-slate-800 bg-slate-400/40 text-slate-800 rounded-md p-2 text-sm"
          placeholder="your expense name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <Input className="w-50 border border-slate-800 bg-slate-400/40 text-slate-800 rounded-md p-2 text-sm"
          placeholder="your amount"
          value={amt}
          onChange={e => setAmt(e.target.value)}
        />

        <Button className="border border-slate-800 text-slate-800 bg-slate-400 px-3 py-2 rounded 
                hover:cursor-pointer hover:font-medium hover:text-black transition"
                onClick={addExpense}>
          Add Expense
        </Button>
      </div>

      <div className="w-full m-0 mt-0 flex flex-col space-y-2 mx-auto p-1">
        <ExpenseList
          expenses={expenses} 
          totalBudget={user.userBudgetTotalAmt} 
          setExpenses={setExpenses}
          setAppMessage={setAppMessage}
        />
      </div>
    </div>
  </>);
}
