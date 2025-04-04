"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { toggleBlogLike } from "./action"

type BlogLikeButtonProps = {
  postId: string
  initialLikes: number
  isLikedByUser: boolean
  isLoggedIn: boolean
}

export function BlogLikeButton({ postId, initialLikes, isLikedByUser, isLoggedIn }: BlogLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(isLikedByUser)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Initialize like state from localStorage for persistence
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")
    setHasLiked(likedPosts.includes(postId))
  }, [postId])

  const handleLike = async () => {
    console.log("handleLike",isLoggedIn,loading)
    if (!isLoggedIn || loading) return

    setLoading(true) // Start loading

    try {
      // Wait for the server response before updating UI
      const response = await toggleBlogLike(postId)

      // Only update UI if the operation was successful
      if (response.success) {
        // If the server returns the new like count, use it directly
        if (response.data?.likesCount !== undefined) {
          setLikes(response.data?.likesCount)
        } else {
          // Otherwise calculate based on current state
          setLikes(hasLiked ? likes - 1 : likes + 1)
        }

        // Update liked status
        const newHasLiked = response.data?.liked !== undefined ? response.data?.liked : !hasLiked
        setHasLiked(newHasLiked)

        // Update localStorage to match server state
        let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")

        if (!newHasLiked) {
          likedPosts = likedPosts.filter((id: string) => id !== postId)
        } else if (!likedPosts.includes(postId)) {
          likedPosts.push(postId)
        }

        localStorage.setItem("likedPosts", JSON.stringify(likedPosts))
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
      // Don't update UI on error
    } finally {
      setLoading(false) // Stop loading
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${hasLiked ? "text-primary" : ""}`}
              onClick={handleLike}
              disabled={!isLoggedIn || loading}
            >
              {loading ? (
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                  role="status"
                  aria-label="Loading"
                />
              ) : (
                <Heart className={`h-4 w-4 ${isLikedByUser ? "fill-red-500" : ""}`} />
              )}
              <span>{likes}</span>
            </Button>
          </div>
        </TooltipTrigger>
        {!isLoggedIn && (
          <TooltipContent>
            <p>Please log in to like this post</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

