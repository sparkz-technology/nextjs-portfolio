"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { addComment, updateComment } from "./comment-actions"
import type { Comment } from "@/lib/types"
import { useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Loader2, Send, X } from "lucide-react"
import clsx from "clsx"

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
    const { data: session, status } = useSession()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus()
            const length = textareaRef.current.value.length
            textareaRef.current.setSelectionRange(length, length)
            setIsFocused(true)
        }
    }, [isEditing])

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return
        if (!session?.user) return

        setIsSubmitting(true)
        try {
            let result

            if (isEditing && commentId) {
                const optimisticComment: Comment = {
                    id: commentId,
                    content,
                    author: {
                        id: session.user.id ?? "",
                        name: session.user.name ?? "",
                        image: session.user.image ?? "",
                    },
                    blogId,
                    parentId: parentId!,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isEdited: true,
                    isAuthor: true,
                    likeCount: 0,
                    replyCount: 0,
                }

                onCommentAdded(optimisticComment)
                result = await updateComment(commentId, content)

                if (result.success) {
                    onCommentAdded(result.comment)
                }
            } else {
                result = await addComment({ blogId, parentId, content })

                if (result.success) {
                    onCommentAdded(result.comment)
                    setContent("")
                    setIsFocused(false)
                }
            }
        } catch (error) {
            console.error("Failed to submit comment:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-[60px] bg-muted rounded-md" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-3 relative">
            <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || "./placeholder.svg"} alt={session?.user?.name || "User"} />
                <AvatarFallback>{session?.user?.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 relative">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Textarea
                                ref={textareaRef}
                                placeholder={placeholder}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                disabled={!session?.user}
                                className={clsx(
                                    "min-h-[60px] resize-none pr-16",
                                    !session?.user && "cursor-not-allowed opacity-70"
                                )}
                            />
                        </TooltipTrigger>
                        {!session?.user && (
                            <TooltipContent side="top" className="text-sm">
                                You must be logged in to comment.
                            </TooltipContent>
                        )}
                    </Tooltip>

                {(isFocused || isEditing) && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="p-1"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}

                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={handleSubmit}
                            disabled={!content.trim() || isSubmitting || !session?.user}
                            className="p-1"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
