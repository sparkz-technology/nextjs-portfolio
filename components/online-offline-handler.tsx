"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Wifi, WifiOff } from "lucide-react"

export default function OnlineOfflineHandler() {
  const [isOnline, setIsOnline] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showOfflinePortal, setShowOfflinePortal] = useState(false)
  const [showOnlineIndicator, setShowOnlineIndicator] = useState(false)

  useEffect(() => {
    // Set initial status
    const online = navigator.onLine
    setIsOnline(online)
    setShowOfflinePortal(!online)
    setInitialLoad(false)

    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      // Show online indicator for 3 seconds
      setShowOnlineIndicator(true)
      // Add a small delay to ensure smooth transition for the offline portal
      setTimeout(() => setShowOfflinePortal(false), 300)
      // Hide online indicator after 3 seconds
      setTimeout(() => setShowOnlineIndicator(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflinePortal(true)
      // Always hide online indicator when offline
      setShowOnlineIndicator(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Register service worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ServiceWorker registration successful with scope: ", registration.scope)
        })
        .catch((err) => {
          console.log("ServiceWorker registration failed: ", err)
        })
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Don't render anything during initial load to prevent flashing
  if (initialLoad) {
    return null
  }

  return (
    <>
      {/* Status indicator - only shown when offline or temporarily when regaining connection */}
      <div
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md transition-all duration-300 ${
          isOnline ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
        } ${!isOnline || showOnlineIndicator ? "opacity-100" : "opacity-0"}`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-600">Back Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-500 animate-ping-slow" />
            <span className="text-sm font-medium text-orange-600">Offline</span>
          </>
        )}
      </div>

      {/* Use createPortal to overlay the offline experience when offline */}
      {showOfflinePortal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-40 bg-white transition-all duration-500 ${
              isOnline ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
             
          </div>,
          document.body,
        )}
    </>
  )
}
