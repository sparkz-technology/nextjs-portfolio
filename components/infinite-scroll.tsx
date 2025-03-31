"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface InfiniteScrollProps {
  ref ?: React.Ref<HTMLDivElement>
  // Forward scrolling props
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  threshold?: number

  // Backward scrolling props
  loadMoreBackward?: () => Promise<void>
  hasMoreBackward?: boolean
  isLoadingBackward?: boolean
  thresholdBackward?: number

  // Common props
  children: React.ReactNode
  className?: string
  loadingIndicator?: React.ReactNode
  loadingIndicatorBackward?: React.ReactNode
}

export function InfiniteScroll({
  ref = null,
  // Forward scrolling props
  loadMore,
  hasMore,
  isLoading,
  threshold = 200,

  // Backward scrolling props
  loadMoreBackward,
  hasMoreBackward = false,
  isLoadingBackward = false,
  thresholdBackward = 200,

  // Common props
  children,
  className = "",
  loadingIndicator = (
    <div className="flex justify-center py-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
  loadingIndicatorBackward = loadingIndicator,
}: InfiniteScrollProps) {
  const [shouldTriggerForward, setShouldTriggerForward] = useState(true)
  const [shouldTriggerBackward, setShouldTriggerBackward] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [prevScrollHeight, setPrevScrollHeight] = useState(0)
  const [prevScrollTop, setPrevScrollTop] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const { scrollTop, scrollHeight, clientHeight } = container

      // Check if we've scrolled to the bottom threshold (forward loading)
      if (!isLoading && hasMore && shouldTriggerForward) {
        if (scrollHeight - scrollTop - clientHeight < threshold) {
          setShouldTriggerForward(false)
          loadMore().finally(() => {
            // Re-enable trigger after the load completes
            setTimeout(() => setShouldTriggerForward(true), 200)
          })
        }
      }

      // Check if we've scrolled to the top threshold (backward loading)
      if (loadMoreBackward && !isLoadingBackward && hasMoreBackward && shouldTriggerBackward) {
        if (scrollTop < thresholdBackward) {
          setShouldTriggerBackward(false)

          // Save current scroll position before loading
          setPrevScrollHeight(scrollHeight)
          setPrevScrollTop(scrollTop)

          loadMoreBackward().finally(() => {
            // Re-enable trigger after the load completes
            setTimeout(() => setShouldTriggerBackward(true), 200)
          })
        }
      }
    }

    const currentContainer = containerRef.current
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [
    loadMore,
    hasMore,
    isLoading,
    threshold,
    shouldTriggerForward,
    loadMoreBackward,
    hasMoreBackward,
    isLoadingBackward,
    thresholdBackward,
    shouldTriggerBackward,
  ])

  // Maintain scroll position after backward loading
  useEffect(() => {
    if (containerRef.current && prevScrollHeight > 0 && !isLoadingBackward) {
      const newScrollHeight = containerRef.current.scrollHeight
      const heightDifference = newScrollHeight - prevScrollHeight

      if (heightDifference > 0) {
        containerRef.current.scrollTop = prevScrollTop + heightDifference
        setPrevScrollHeight(0)
        setPrevScrollTop(0)
      }
    }
  }, [isLoadingBackward, prevScrollHeight, prevScrollTop])

  return (
    <div ref={containerRef} className={className}>
      {isLoadingBackward && loadingIndicatorBackward}
      <div ref={ref}>

      {children}
      </div>
      {isLoading && loadingIndicator}
    </div>
  )
}

