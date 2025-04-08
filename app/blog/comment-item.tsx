// "use client";

// import { useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { CommentForm } from "./comment-form";
// import { CommentList } from "./comment-list";
// import type { Comment } from "@/lib/types";
// import { deleteComment, getCommentReplies, reportComment, likeComment } from "./comment-actions";
// import { formatTimeAgo } from "@/lib/utils";
// import { Flag, MoreVertical, Heart } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// import { PortalWrapper } from "@/components/portal-wrapper";

// interface CommentItemProps {
//   comment: Comment;
//   onUpdateComment: (comment: Comment) => void;
//   onDeleteComment: (commentId: string) => void;
//   onSetIsNewComments: (visible: boolean) => void;
// }

// export function CommentItem({ comment, onUpdateComment, onDeleteComment, onSetIsNewComments }: CommentItemProps) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [isReplying, setIsReplying] = useState(false);
//   const [replies, setReplies] = useState<Comment[]>([]);
//   const [showReplies, setShowReplies] = useState(false);
//   const [repliesLoaded, setRepliesLoaded] = useState(false);
//   const [repliesCount, setRepliesCount] = useState(comment.replyCount || 0);
//   const [isLiked, setIsLiked] = useState(comment.isLiked || false);
//   const { status } = useSession();

//   const handleEdit = () => {
//     setIsEditing(true);
//     onSetIsNewComments(false);
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     onSetIsNewComments(true);
//   };

//   const handleUpdate = (updatedComment: Comment) => {
//     onUpdateComment(updatedComment);
//     setIsEditing(false);
//     onSetIsNewComments(true);
//   };

//   const handleDelete = async () => {
//     try {
//       // For nested comments, we need to handle the UI update differently
//       if (comment.parentId) {
//         // First remove from UI
//         onDeleteComment(comment.id);

//         // Then perform the server action
//         await deleteComment(comment.id);
//       } else {
//         // For parent comments, we need to remove all replies from UI as well
//         // First remove from UI (this will be handled by the parent component)
//         onDeleteComment(comment.id);

//         // Then perform the server action
//         await deleteComment(comment.id);

//         // If this comment has replies and they're loaded, we need to clear them
//         if (repliesCount > 0 && repliesLoaded) {
//           setReplies([]);
//           setRepliesCount(0);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to delete comment:", error);
//     }
//   };

//   // Add this function to handle deleting a reply
//   const handleDeleteReply = (replyId: string) => {
//     // Update the local replies state
//     setReplies((prevReplies) => prevReplies.filter((reply) => reply.id !== replyId));

//     // Update the reply count
//     setRepliesCount((prev) => prev - 1);

//     // Propagate the delete to the parent
//     onDeleteComment(replyId);
//   };

//   const handleReport = async () => {
//     // Prevent reporting own content
//     if (comment.isAuthor) {
//       toast.error("You cannot report your own comment");
//       return;
//     }

//     try {
//       await reportComment(comment.id);
//       toast.success("Comment reported successfully");
//     } catch (error) {
//       if (error instanceof Error) {
//         toast.error(error.message);
//       } else {
//         toast.error("Failed to report comment");
//       }
//       console.error("Failed to report comment:", error);
//     }
//   };

//   const handleReply = () => {
//     setIsReplying(true);
//     onSetIsNewComments(false);
//   };

//   const handleCancelReply = () => {
//     setIsReplying(false);
//     onSetIsNewComments(true);
//   };

//   const handleAddReply = (newReply: Comment) => {
//     // Add the new reply to the beginning of the replies array
//     const updatedReplies = [newReply, ...replies];
//     setReplies(updatedReplies);
//     setRepliesCount((prev) => prev + 1);

//     // Ensure replies are visible
//     setIsReplying(false);
//     setShowReplies(true);
//     setRepliesLoaded(true);
//     onSetIsNewComments(true);

//     // Update the parent comment to reflect the new reply count
//     onUpdateComment({
//       ...comment,
//       replyCount: comment.replyCount + 1,
//     });
//   };

//   const handleUpdateReply = (updatedComment: Comment) => {
//     // First update the local replies state
//     setReplies((prevReplies) => prevReplies.map((reply) => (reply.id === updatedComment.id ? updatedComment : reply)));
//     onSetIsNewComments(true);
//     // Then propagate the update to the parent
//     onUpdateComment(updatedComment);

//   };

//   const loadReplies = async () => {
//     if (!repliesLoaded && repliesCount > 0) {
//       try {
//         const result = await getCommentReplies(comment.id);
//         setReplies(result.comments);
//         setRepliesLoaded(true);
//       } catch (error) {
//         console.error("Failed to load replies:", error);
//       }
//     }
//     setShowReplies(!showReplies);
//   };

//   const handleLike = async () => {
//     // Optimistically update UI
//     const newIsLiked = !isLiked;
//     const newLikeCount = isLiked ? comment.likeCount - 1 : comment.likeCount + 1;

//     setIsLiked(newIsLiked);

//     // Create updated comment object
//     const updatedComment = {
//       ...comment,
//       likeCount: newLikeCount,
//       isLiked: newIsLiked,
//     };

//     // Update local state and propagate to parent
//     onUpdateComment(updatedComment);

//     try {
//       await likeComment(comment.id, newIsLiked);
//     } catch (error) {
//       // Revert UI changes if the API call fails
//       setIsLiked(!newIsLiked);
//       onUpdateComment({
//         ...comment,
//         likeCount: comment.likeCount,
//         isLiked: isLiked,
//       });
//       console.error("Failed to like comment:", error);
//     }
//   };

//   return (
//     <div className="group">
//       <div className="flex gap-3">
//         <Avatar className="h-8 w-8">
//           <AvatarImage src={comment.author.image || "./placeholder.svg"} alt={comment.author.name ?? "R"} />
//           <AvatarFallback>{(comment.author.name ?? "R").charAt(0)}</AvatarFallback>
//         </Avatar>

//         <div className="flex-1 space-y-1">
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-medium">{comment.author.name}</span>
//             <span className="text-xs text-muted-foreground">{formatTimeAgo(new Date(comment.createdAt))}</span>
//             {comment.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
//           </div>

//           {isEditing ? (
//             <PortalWrapper containerId="commentForm">
//               <CommentForm
//                 initialValue={comment.content}
//                 blogId={comment.blogId}
//                 parentId={comment.parentId!}
//                 commentId={comment.id}
//                 onCommentAdded={handleUpdate}
//                 onCancel={handleCancelEdit}
//                 isEditing
//               />
//             </PortalWrapper>
//           ) : null}
//           <div className="text-sm">{comment.content}</div>

//           {!isEditing && (
//             <div className="flex items-center gap-4 pt-1">
//               <Tooltip>
//                 <TooltipTrigger>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     disabled={status !== "authenticated"}
//                     className={`h-8 px-2 ${isLiked ? "text-red-500" : "text-primary"}`}
//                     onClick={handleLike}
//                   >
//                     <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
//                     <span className="text-xs">{comment.likeCount || 0}</span>
//                   </Button>
//                   <TooltipContent>{status === "unauthenticated" ? "Log in to like" : "Like"}</TooltipContent>
//                 </TooltipTrigger>
//               </Tooltip>
//               <Tooltip>
//                 <TooltipTrigger>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-8 px-2"
//                     onClick={handleReply}
//                     disabled={status !== "authenticated"}
//                   >
//                     Reply
//                   </Button>
//                   <TooltipContent>{status === "unauthenticated" ? "Log in to reply" : "Reply"}</TooltipContent>
//                 </TooltipTrigger>
//               </Tooltip>
//             </div>
//           )}

//           {isReplying && (
//             <PortalWrapper containerId="commentForm">
//               <CommentForm
//                 blogId={comment.blogId}
//                 parentId={comment.id}
//                 author={comment.author.name || "unknown"}
//                 onCommentAdded={handleAddReply}
//                 onCancel={handleCancelReply}
//                 placeholder="Add a reply..."
//               />
//             </PortalWrapper>
//           )}

//           {repliesCount > 0 && !isReplying && (
//             <Button variant="ghost" size="sm" className="mt-1 text-primary" onClick={loadReplies}>
//               {showReplies
//                 ? `Hide ${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`
//                 : `View ${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`}
//             </Button>
//           )}

//           {showReplies && repliesLoaded && (
//             <CommentList
//               comments={replies}
//               onSetIsNewComments={onSetIsNewComments}
//               onUpdateComment={handleUpdateReply}
//               onDeleteComment={handleDeleteReply}
//               isNested
//             />
//           )}
//         </div>

//         <DropdownMenu>
//           <Tooltip>
//             <DropdownMenuTrigger asChild disabled={status !== "authenticated"}>
//               <TooltipTrigger>
//                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
//                   <MoreVertical className="h-4 w-4" />
//                   <span className="sr-only">More options</span>
//                 </Button>
//               </TooltipTrigger>
//             </DropdownMenuTrigger>
//             <TooltipContent>{status === "unauthenticated" ? "Log in for more options" : "More options"}</TooltipContent>
//           </Tooltip>
//           <DropdownMenuContent align="end">
//             {comment.isAuthor && (
//               <>
//                 <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
//                 <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
//                 <DropdownMenuSeparator />
//               </>
//             )}
//             <DropdownMenuItem
//               hidden={comment.isAuthor}
//               onClick={handleReport}
//               disabled={comment.isAuthor}
//               className={comment.isAuthor ? "text-muted-foreground cursor-not-allowed" : ""}
//             >
//               <Flag className="mr-2 h-4 w-4" />
//               {comment.isAuthor ? "Cannot report own comment" : "Report"}
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </div>
//   );
// }
"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommentForm } from "./comment-form"
import { CommentList } from "./comment-list"
import { CommentSkeleton } from "./comment-skeleton"
import type { Comment } from "@/lib/types"
import { deleteComment, getCommentReplies, reportComment, likeComment } from "./comment-actions"
import { formatTimeAgo } from "@/lib/utils"
import { Flag, MoreVertical, Heart, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { PortalWrapper } from "@/components/portal-wrapper"

interface CommentItemProps {
  comment: Comment
  onUpdateComment: (comment: Comment) => void
  onDeleteComment: (commentId: string) => void
  onSetIsNewComments: (visible: boolean) => void
}

export function CommentItem({ comment, onUpdateComment, onDeleteComment, onSetIsNewComments }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const [showReplies, setShowReplies] = useState(false)
  const [repliesLoaded, setRepliesLoaded] = useState(false)
  const [repliesCount, setRepliesCount] = useState(comment.replyCount || 0)
  const [isLiked, setIsLiked] = useState(comment.isLiked || false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { status } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    onSetIsNewComments(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    onSetIsNewComments(true)
  }

  const handleUpdate = (updatedComment: Comment) => {
    onUpdateComment(updatedComment)
    setIsEditing(false)
    onSetIsNewComments(true)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // For nested comments, we need to handle the UI update differently
      if (comment.parentId) {

        await deleteComment(comment.id)
        onDeleteComment(comment.id)
      } else {

        await deleteComment(comment.id)
        onDeleteComment(comment.id)

        if (repliesCount > 0 && repliesLoaded) {
          setReplies([])
          setRepliesCount(0)
        }
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast.error("Failed to delete comment")
      setIsDeleting(false)
    }
  }

  // Add this function to handle deleting a reply
  const handleDeleteReply = (replyId: string) => {
    // Update the local replies state
    setReplies((prevReplies) => prevReplies.filter((reply) => reply.id !== replyId))

    // Update the reply count
    setRepliesCount((prev) => prev - 1)

    // Propagate the delete to the parent
    onDeleteComment(replyId)
  }

  const handleReport = async () => {
    // Prevent reporting own content
    if (comment.isAuthor) {
      toast.error("You cannot report your own comment")
      return
    }

    setIsReporting(true)
    try {
      await reportComment(comment.id)
      toast.success("Comment reported successfully")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Failed to report comment")
      }
      console.error("Failed to report comment:", error)
    } finally {
      setIsReporting(false)
    }
  }

  const handleReply = () => {
    setIsReplying(true)
    onSetIsNewComments(false)
  }

  const handleCancelReply = () => {
    setIsReplying(false)
    onSetIsNewComments(true)
  }

  const handleAddReply = (newReply: Comment) => {
    // Add the new reply to the beginning of the replies array
    const updatedReplies = [newReply, ...replies]
    setReplies(updatedReplies)
    setRepliesCount((prev) => prev + 1)

    // Ensure replies are visible
    setIsReplying(false)
    setShowReplies(true)
    setRepliesLoaded(true)
    onSetIsNewComments(true)

    // Update the parent comment to reflect the new reply count
    onUpdateComment({
      ...comment,
      replyCount: comment.replyCount + 1,
    })
  }

  const handleUpdateReply = (updatedComment: Comment) => {
    // First update the local replies state
    setReplies((prevReplies) => prevReplies.map((reply) => (reply.id === updatedComment.id ? updatedComment : reply)))
    onSetIsNewComments(true)
    // Then propagate the update to the parent
    onUpdateComment(updatedComment)
  }

  const loadReplies = async () => {
    if (!repliesLoaded && repliesCount > 0) {
      setIsLoadingReplies(true)
      try {
        const result = await getCommentReplies(comment.id)
        setReplies(result.comments)
        setRepliesLoaded(true)
      } catch (error) {
        console.error("Failed to load replies:", error)
        toast.error("Failed to load replies")
      } finally {
        setIsLoadingReplies(false)
      }
    }
    setShowReplies(!showReplies)
  }

  const handleLike = async () => {
    setIsLikeLoading(true)
    // Optimistically update UI
    const newIsLiked = !isLiked
    const newLikeCount = isLiked ? comment.likeCount - 1 : comment.likeCount + 1

    setIsLiked(newIsLiked)

    // Create updated comment object
    const updatedComment = {
      ...comment,
      likeCount: newLikeCount,
      isLiked: newIsLiked,
    }

    // Update local state and propagate to parent
    onUpdateComment(updatedComment)

    try {
      await likeComment(comment.id, newIsLiked)
    } catch (error) {
      // Revert UI changes if the API call fails
      setIsLiked(!newIsLiked)
      onUpdateComment({
        ...comment,
        likeCount: comment.likeCount,
        isLiked: isLiked,
      })
      console.error("Failed to like comment:", error)
      toast.error("Failed to like comment")
    } finally {
      setIsLikeLoading(false)
    }
  }

  if (!mounted) {
    return <CommentSkeleton />
  }

  return (
    <TooltipProvider>
      <div className="group">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.image || "./placeholder.svg"} alt={comment.author.name ?? "R"} />
            <AvatarFallback>{(comment.author.name ?? "R").charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(new Date(comment.createdAt))}</span>
              {comment.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
            </div>

            {isEditing ? (
              <PortalWrapper containerId="commentForm">
                <CommentForm
                  initialValue={comment.content}
                  blogId={comment.blogId}
                  parentId={comment.parentId!}
                  commentId={comment.id}
                  onCommentAdded={handleUpdate}
                  onCancel={handleCancelEdit}
                  isEditing
                />
              </PortalWrapper>
            ) : null}
            <div className="text-sm">{comment.content}</div>

            {!isEditing && (
              <div className="flex items-center gap-4 pt-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="unstyled"
                      size="sm"
                      disabled={status !== "authenticated" || isLikeLoading}
                      className={`h-8 px-2 ${isLiked ? "text-red-500" : "text-primary"}`}
                      onClick={handleLike}
                    >
                      {isLikeLoading ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
                      )}
                      <span className="text-xs">{comment.likeCount || 0}</span>
                    </Button>
                    <TooltipContent>{status === "unauthenticated" ? "Log in to like" : "Like"}</TooltipContent>
                  </TooltipTrigger>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="unstyled"
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleReply}
                      disabled={status !== "authenticated"}
                    >
                      Reply
                    </Button>
                    <TooltipContent>{status === "unauthenticated" ? "Log in to reply" : "Reply"}</TooltipContent>
                  </TooltipTrigger>
                </Tooltip>
              </div>
            )}

            {isReplying && (
              <PortalWrapper containerId="commentForm">
                <CommentForm
                  blogId={comment.blogId}
                  parentId={comment.id}
                  author={comment.author.name || "unknown"}
                  onCommentAdded={handleAddReply}
                  onCancel={handleCancelReply}
                  placeholder="Add a reply..."
                />
              </PortalWrapper>
            )}

            {repliesCount > 0 && !isReplying && (
              <Button
                variant="unstyled"
                size="sm"
                className="mt-1 text-primary"
                onClick={loadReplies}
                disabled={isLoadingReplies}
              >
                {isLoadingReplies ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading replies...
                  </>
                ) : showReplies ? (
                  `Hide ${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`
                ) : (
                  `View ${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`
                )}
              </Button>
            )}

            {showReplies && (
              <CommentList
                comments={replies}
                onSetIsNewComments={onSetIsNewComments}
                onUpdateComment={handleUpdateReply}
                onDeleteComment={handleDeleteReply}
                isNested
                isLoading={isLoadingReplies && !repliesLoaded}
              />
            )}
          </div>

          <DropdownMenu>
            <Tooltip>
              <DropdownMenuTrigger asChild disabled={status !== "authenticated"}>
                <TooltipTrigger>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
{isDeleting || isReporting  ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) :(
                    <MoreVertical className="h-4 w-4" />)}
                    <span className="sr-only">More options</span>
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <TooltipContent>
                {status === "unauthenticated" ? "Log in for more options" : "More options"}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {comment.isAuthor && (
                <>
                  <DropdownMenuItem onClick={handleEdit} disabled={isDeleting}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                hidden={comment.isAuthor}
                onClick={handleReport}
                disabled={comment.isAuthor || isReporting}
                className={comment.isAuthor ? "text-muted-foreground cursor-not-allowed" : ""}
              >
                {isReporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reporting...
                  </>
                ) : (
                  <>
                    <Flag className="mr-2 h-4 w-4" />
                    {comment.isAuthor ? "Cannot report own comment" : "Report"}
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}
