"use client"

import { useEffect, useState } from "react"
import { CommentList } from "./comment-list"
import { CommentForm } from "./comment-form"
import { getComments } from "./comment-actions"
import type { Comment } from "@/lib/types"

interface CommentSectionProps {
    blogId: string
}

export function CommentSection({ blogId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInitialComments = async () => {
      setIsLoading(true)
      try {
        const result = await getComments({ blogId, limit: 2 })
        setComments(result.comments)
        setTotalComments(result.total)
      } catch (error) {
        console.error("Failed to load comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialComments()
  }, [blogId])

  const handleAddComment = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev])
    setTotalComments((prev) => prev + 1)
  }

  const handleUpdateComment = (updatedComment: Comment) => {
    setComments((prev) => {
      // Helper function to recursively update comments
      const updateCommentInList = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          // If this is the comment to update, return the updated version
          if (comment.id === updatedComment.id) {
            return updatedComment
          }

          // Otherwise, return the original comment
          return comment
        })
      }

      return updateCommentInList(prev)
    })
  }

  const handleDeleteComment = (commentId: string) => {
    // Recursively filter out the deleted comment and its replies
    const filterDeletedComments = (comments: Comment[]): Comment[] => {
      return comments.filter((comment) => {
        // Remove the comment if it matches the deleted ID
        if (comment.id === commentId) {
          return false
        }

        // Keep all other comments
        return true
      })
    }

    setComments(filterDeletedComments)
    setTotalComments((prev) => prev - 1)
  }

  const handleLoadMore = async () => {
    if (comments.length >= totalComments) return

    try {
      const lastCommentId = comments[comments.length - 1].id
      const result = await getComments({
        blogId,
        limit: 5,
        cursor: lastCommentId,
      })

      setComments((prev) => [...prev, ...result.comments])
    } catch (error) {
      console.error("Failed to load more comments:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{totalComments} Comments</h2>
      <CommentForm blogId={blogId} onCommentAdded={handleAddComment} />

      {isLoading ? (
        <div className="py-4 text-center text-muted-foreground">Loading comments...</div>
      ) : (
        <>
          <CommentList
            comments={comments}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />

          {comments.length < totalComments && (
            <button
              onClick={handleLoadMore}
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Show more comments
            </button>
          )}
        </>
      )}
    </div>
  )
}

