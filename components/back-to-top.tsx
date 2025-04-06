"use client"

import { useEffect, useState } from "react"
import { Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BackToTop() {
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    setIsMounted(true) 

    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    toggleVisibility() // in case the user already scrolled
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  if (!isMounted) return null 

  return (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "fixed bottom-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-500",
        "bg-white hover:bg-gray-50",
        "dark:bg-black dark:hover:bg-gray-900",
        "border-2 border-gray-200 dark:border-gray-800",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
        "group",
      )}
      aria-label="Back to top"
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-800",
          "transition-opacity duration-300",
          isHovering ? "opacity-30 animate-ping" : "opacity-0",
        )}
        style={{ animationDuration: "2000ms" }}
      />

      <div className="relative flex items-center justify-center">
        <Rocket
          className={cn(
            "h-4 w-4 transition-all duration-300",
            "text-gray-800 dark:text-gray-200",
            isHovering ? "-rotate-45 scale-110" : "rotate-0 scale-100",
          )}
        />

        {isHovering && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <span
              className="absolute h-1.5 w-1.5 rounded-full bg-gray-800 dark:bg-gray-200"
              style={{
                animation: "particle1 1s ease-out infinite",
                left: "-4px",
              }}
            />
            <span
              className="absolute h-1 w-1 rounded-full bg-gray-600 dark:bg-gray-400"
              style={{
                animation: "particle2 1s ease-out infinite",
                left: "0px",
                animationDelay: "0.2s",
              }}
            />
            <span
              className="absolute h-0.5 w-0.5 rounded-full bg-gray-400 dark:bg-gray-600"
              style={{
                animation: "particle3 1s ease-out infinite",
                left: "4px",
                animationDelay: "0.4s",
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes particle1 {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-10px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes particle2 {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-8px) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes particle3 {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-6px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  )
}
