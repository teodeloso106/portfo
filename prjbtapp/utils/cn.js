/*
 * teodeloso@gmail.com
 *
 * helper function(s) for tailwindcss
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
