/*
 * teodeloso@gmail.com
 *
 * Budget Tracker App button
 */

import { cn } from '@/utils/cn';

export default function Button({ children, onClick, className}) {
  return (
    <button
      onClick={onClick}
      className={cn("bg-blue-500 text-white px-4 py-2 rounded", className)}>
      {children}
    </button>
  );
}
