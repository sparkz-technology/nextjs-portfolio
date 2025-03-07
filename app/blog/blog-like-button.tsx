"use client"

import { useState, useEffect } from "react"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"

type BlogLikeButtonProps = {
  postId: string
  initialLikes: number
}

export function BlogLikeButton({ postId, initialLikes }: BlogLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user has already liked this post
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")
    setHasLiked(likedPosts.includes(postId))

    // Check if user is admin (in a real app, this would come from auth)
    // For demo purposes, we'll just set a flag in localStorage
    setIsAdmin(localStorage.getItem("isAdmin") === "true")
  }, [postId])

  const handleLike = () => {
    if (isAdmin || hasLiked) return

    // Update likes count
    const newLikes = likes + 1
    setLikes(newLikes)
    setHasLiked(true)

    // Store liked status in localStorage
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]")
    localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, postId]))

    // In a real app, you would send this to an API
    // fetch(`/api/blog/${postId}/like`, { method: 'POST' })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-1 ${hasLiked ? "text-primary" : ""} ${isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleLike}
      disabled={hasLiked || isAdmin}
      title={isAdmin ? "Admins cannot like posts" : hasLiked ? "You already liked this post" : "Like this post"}
    >
      <ThumbsUp className="h-4 w-4" />
      <span>{likes}</span>
    </Button>
  )
}

