import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Confetti from "canvas-confetti";
import { parse, isValid, format, formatDistanceToNow } from "date-fns";

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

export const parseCustomDate = (dateStr: string): string => {
    const date = parse(dateStr, "dd/MM/yyyy", new Date());
    return isValid(date) ? format(date, "MMM-yy") : "Present";
};
// export function formatDate(dateString: string): string {
//   const date = new Date(dateString)
//   return new Intl.DateTimeFormat("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   }).format(date)
// }
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}

export function formatDate(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}

export function getFileType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp"]
  const documentExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"]
  const videoExtensions = ["mp4", "webm", "mov", "avi"]
  const audioExtensions = ["mp3", "wav", "ogg"]

  if (imageExtensions.includes(extension)) return "image"
  if (documentExtensions.includes(extension)) return "document"
  if (videoExtensions.includes(extension)) return "video"
  if (audioExtensions.includes(extension)) return "audio"

  return "other"
}

export function calculateReadTime(text: string): number {
  // Average reading speed in words per minute
  const WORDS_PER_MINUTE = 200;
  // Remove markdown formatting and count words
  const wordCount = text.split(/\s+/).length;
  
  // Calculate and round up to nearest minute
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
