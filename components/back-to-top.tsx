"use client"

import { useEffect, useState } from "react"
import { Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Check if we've scrolled down enough to show the button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
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
      {/* Outer ring animation */}
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          "animate-ping opacity-30",
          "bg-gray-200 dark:bg-gray-800",
          isHovering ? "duration-[2000ms]" : "duration-0 opacity-0",
        )}
      />

      {/* Inner content with animation */}
      <div className="relative flex items-center justify-center">
        <Rocket
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            "text-gray-800 dark:text-gray-200",
            "rotate-0 group-hover:-rotate-45 group-hover:scale-110",
            "group-hover:animate-pulse",
          )}
        />

        {/* Particle effects on hover */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          {isHovering && (
            <>
              <span className="absolute h-1.5 w-1.5 animate-particle1 rounded-full bg-gray-800 dark:bg-gray-200" />
              <span className="absolute h-1 w-1 animate-particle2 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="absolute h-0.5 w-0.5 animate-particle3 rounded-full bg-gray-400 dark:bg-gray-600" />
            </>
          )}
        </div>
      </div>
    </button>
  )
}

