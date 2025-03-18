"use client"

import { useState, useEffect } from "react"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
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
    if (!isLoggedIn || loading) return

    setLoading(true)

    try {
      const success = await toggleBlogLike(postId)
      if (success) {
        const newLikes = hasLiked ? likes - 1 : likes + 1
        setLikes(newLikes)
        setHasLiked(!hasLiked)

        // Update localStorage to toggle like status
        let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")

        if (hasLiked) {
          likedPosts = likedPosts.filter((id: string) => id !== postId)
        } else {
          likedPosts.push(postId)
        }

        localStorage.setItem("likedPosts", JSON.stringify(likedPosts))
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    } finally {
      setLoading(false)
    }
  }

  const LikeButtonContent = () => (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-1 ${hasLiked ? "text-primary" : ""}`}
      onClick={handleLike}
      disabled={!isLoggedIn || loading}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <ThumbsUp className="h-4 w-4" />
      )}
      <span>{likes}</span>
    </Button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <LikeButtonContent />
        </div>
      </TooltipTrigger>
      {!isLoggedIn && (
        <TooltipContent>
          <p>Please log in to like this post</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
