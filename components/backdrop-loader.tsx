"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const BackdropLoader = () => {

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-300"
      )}
    >
      <div role="status" className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="mt-2 text-sm text-gray-300">Loading...</p>
      </div>
    </div>
  );
};
