import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Confetti from "canvas-confetti";
import { parse, isValid, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sideCannonsConfetti = async (seconds?: number, colors?: string[]) => {
  seconds = seconds || 3;
  colors = colors || ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  const end = Date.now() + seconds * 1000;

  const frame = () => {
    if (Date.now() > end) return;

    Confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });
    Confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });
    requestAnimationFrame(frame);
  };
  frame();
};

export const parseCustomDateForTable = (dateStr: string): string => {
    const date = parse(dateStr, "dd/MM/yyyy", new Date());
    return isValid(date) ? format(date, "MMM-yy") : "Present";
};
