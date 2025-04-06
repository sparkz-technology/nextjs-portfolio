"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { addComment, updateComment } from "./comment-actions"
import type { Comment } from "@/lib/types"

interface CommentFormProps {
  blogId: string
  parentId?: string
  commentId?: string
  initialValue?: string
  onCommentAdded: (comment: Comment) => void
  onCancel?: () => void
  isEditing?: boolean
  placeholder?: string
}

export function CommentForm({
  blogId,
  parentId,
  commentId,
  initialValue = "",
  onCommentAdded,
  onCancel,
  isEditing = false,
  placeholder = "Add a comment...",
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // Place cursor at the end
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
      setIsFocused(true)
    }
  }, [isEditing])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      let result

      if (isEditing && commentId) {
        // For editing, create an optimistic update
        const optimisticComment: Comment = {
          id: commentId,
          content: content,
          author: { id: "current-user", name: "You", image: "/placeholder-user.jpg" },
          blogId: blogId,
          parentId: parentId!,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEdited: true,
          isAuthor: true,
          likeCount: 0, // This will be updated with the actual value from the server
          replyCount: 0, // This will be updated with the actual value from the server
        }

        // Apply optimistic update
        onCommentAdded(optimisticComment)

        // Then perform the actual update
        result = await updateComment(commentId, content)

        if (result.success) {
          // Update with the actual server response
          onCommentAdded(result.comment)
        }
      } else {
        result = await addComment({
          blogId,
          parentId,
          content,
        })

        if (result.success) {
          onCommentAdded(result.comment)
          setContent("")
          setIsFocused(false)
        }
      }
    } catch (error) {
      console.error("Failed to submit comment:", error)
      // Could add error handling UI here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src="/placeholder-user.jpg" alt="Your avatar" />
        <AvatarFallback>YA</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="min-h-[60px] resize-none"
        />

        {(isFocused || isEditing) && (
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}

            <Button type="button" onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
              {isEditing ? "Save" : "Comment"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

