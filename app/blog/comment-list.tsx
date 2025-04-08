import type { Comment } from "@/lib/types"
import { CommentItem } from "./comment-item"
import { useState, useEffect } from "react"
import { CommentListSkeleton } from "./comment-skeleton"

interface CommentListProps {
  comments: Comment[]
  onSetIsNewComments: (visible: boolean) => void
  onUpdateComment: (comment: Comment) => void
  onDeleteComment: (commentId: string) => void
  isNested?: boolean
  isLoading?: boolean
}

export function CommentList({ comments, onUpdateComment, onDeleteComment,onSetIsNewComments, isNested = false }: CommentListProps) {

    const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return <CommentListSkeleton count={comments.length || 3} isNested={isNested} />
  }
  if (comments.length === 0) {
    return null
  }
  return (
    <div className={`space-y-4 ${isNested ? "ml-12 mt-4" : ""}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onSetIsNewComments={onSetIsNewComments}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  )
}

