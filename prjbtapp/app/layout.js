/*
 * teodeloso@gmail.com
 *
 * Budget Tracker App global layout config
 */
'use client';

import "./globals.css";
import { useRef } from 'react';
import {COMP_PROG_LNK, BT_APP_VER, BT_APP_CPYRGT} from '@/lib/constants';

export default function RootLayout({ children }) {
  const dialogRef = useRef(null);

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
  };

  return (
    <html lang="en">
      <head>
        <title>Budget Tracker</title>
      </head>
      <body className="bg-white text-slate-100 antialiased">

        {/* shared global top navigation navbar */}

        {/* viewport layout */}
        <div className="min-h-screen flex flex-col text-slate-100 antialiased">

          {/* title section */}
          <section className="relative w-full min-h-[20vh] py-12 flex flex-col items-center justify-center 
                    text-center px-4 bg-cover bg-center bg-no-repeat bg-[url(/budgettracker.jpg)]">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]" aria-hidden="true" />

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-400 
                  [-webkit-text-stroke:1.5px_#020617] 
                  [paint-order:stroke_fill]">
                Budget Tracker
              </h1>
              <div className="max-w-xl text-base sm:text-lg text-slate-300 font-light mt-1">
                <p>A simple tool that helps track</p>
                <p>expenses base on a budget</p>
              </div>
              <h3 className="max-w-xl text-base sm:text-lg text-slate-300 font-light mt-1 
                  hover:cursor-pointer hover:font-medium hover:text-slate-50 transition" 
                  onClick={openModal}>
                → How To ...
              </h3>
            </div>
          </section>

          {/* main section */}
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
            {children}
          </main>

          {/* footer section */}
          <footer className="w-full h-24 shrink-0 border-t border-slate-950 bg-slate-950/90 backdrop-blur-md">
            <div className="mx-auto max-w-7xl h-full px-4 flex flex-col sm:flex-row items-center justify-center 
                  sm:justify-between gap-2 sm:gap-0 text-xs font-medium text-slate-500">
              <p className="text-center sm:text-left">
                BudgetTracker {BT_APP_VER}
              </p>
              <div className="flex flex-row gap-6">
                <p>© {BT_APP_CPYRGT}</p>
                <a href={COMP_PROG_LNK} className="hover:text-slate-300 transition">teo · ComputerProgrammer</a>
              </div>
            </div>
          </footer>

          <dialog ref={dialogRef} className="m-auto rounded-xl p-6 w-full max-w-md bg-slate-400 text-slate-800 
                  border border-slate-800 shadow-2xl backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-700">Budget Tracker usage:</h3>
                <button onClick={closeModal} className="text-slate-800 hover:text-black 
                        text-sm hover:cursor-pointer"> ✕ </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-slate-700">Add User</h4>
                  <p>
                    Click the {" "} <span className="italic bg-slate-500 text-slate-300">New User
                    </span> button. Provide a name and a budget in the <span className="italic bg-slate-500 text-slate-300">
                    your user name</span> and {" "} <span className="italic bg-slate-500 text-slate-300">
                    your budget</span> text boxes. Click the {" "} <span className="italic bg-slate-500 text-slate-300">
                    Create</span> button.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">View User Expenses</h4>
                  <p>
                    Double-click or <span className="italic bg-slate-500 text-slate-300">tap twice</span> on a user from the list of existing users.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">Delete User</h4>
                  <p>
                    Hover the mouse pointer or <span className="italic bg-slate-500 text-slate-300">tap once</span> on a user from the list of existing users. Click the {" "}
                    <span className="italic bg-slate-500 text-slate-300">delete</span> icon.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">Add Expense</h4>
                  <p>
                    Select user from the list of existing users or refer to {" "} <span className="italic 
                    bg-slate-500 text-slate-300">Add User</span> section. Provide a name and an amount 
                    in the {" "} <span className="italic bg-slate-500 text-slate-300">your expense name
                    </span> and {" "} <span className="italic bg-slate-500 text-slate-300">your amount
                    </span> text boxes. Click the {" "} <span className="italic bg-slate-500 text-slate-300">
                    Add Expense</span> button.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">Delete Expense</h4>
                  <p>
                    Hover the mouse pointer or <span className="italic bg-slate-500 text-slate-300">tap once</span> on an expense from the list of expenses. Click the {" "}
                    <span className="italic bg-slate-500 text-slate-300">delete</span> icon.
                  </p>
                </div>

              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-800 
                      hover:cursor-pointer hover:text-black transition">
                  Close
                </button>
              </div>
            </div>
          </dialog>

        </div>
        
      </body>
    </html>
  );
}
