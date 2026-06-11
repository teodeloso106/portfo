/*
 * teodeloso@gmail.com
 *
 * Budget Tracker App input field
 */

import { cn } from '@/utils/cn';

export default function Input({ value, onChange, placeholder, className }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("border p-2 rounded w-full", className)}
    />
  );
}
