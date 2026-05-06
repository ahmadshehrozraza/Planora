import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
        result += characters[randomArray[i] % characters.length];
    }
    
    return result;
}

export function snakeCaseToTitleCase(str: string){
  if(!str) return "";
  
  return str.toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
};

export const toNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

export function dateFormatter(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;

  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" }).toString();
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

export function daysSinceStart(startDate: Date | string): string {
  const today = new Date();
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const diffMs = today.getTime() - start.getTime();
  return `${Math.floor(diffMs / (1000 * 60 * 60 * 24))} days ago`;
}

export function daysUntilDue(dueDate: Date | string): number {
  const today = new Date();
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return diffDays;
  } else if (diffDays === 0) {
    return 1;
  } else {
    return Math.abs(diffDays);
  }
}
