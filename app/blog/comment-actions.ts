"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Author, Comment } from "@/lib/types";

export async function addComment({
    blogId,
  parentId,
  content,
}: {
    blogId: string;
  parentId?: string;
  content: string;
}) {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("You must be logged in to add a comment");
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        blogId,
        authorId: session.user.id,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id,
          },
          take: 1,
        },
      },
    });

    const transformedComment: Comment = {
      id: comment.id,
      content: comment.content,
      author: comment.author as Comment["author"],
      blogId: comment.blogId,
      parentId: comment.parentId,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isEdited: false,
      isAuthor: true,
      likeCount: comment._count.likes,
      replyCount: comment._count.replies,
      isLiked: comment.likes && comment.likes.length > 0,
    };

    revalidatePath(`/videos/${blogId}`);

    return { success: true, comment: transformedComment };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
}

interface GetCommentsParams {
  blogId: string;
  limit?: number;
  cursor?: string;
  parentId?: string | null;
}

// Update getComments to include user's like status
export async function getComments({ blogId, limit = 10, parentId = null }: GetCommentsParams) {
  try {
    const session = await auth();

    // Execute the query
    const comments = await prisma.comment.findMany({
      where: {
        blogId,
        ...(parentId ? { parentId } : {  }),
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
        likes: session?.user.id
          ? {
              where: {
                userId: session.user.id,
              },
              take: 1,
            }
          : undefined,
      },
    });

    // Get total count
    const total = await prisma.comment.count({
      where: {
        blogId,
        parentId,
      },
    });

    // Transform the data
    const transformedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.author,
      blogId: comment.blogId,
      parentId: comment.parentId,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isEdited: comment.createdAt.getTime() !== comment.updatedAt.getTime(),
      isAuthor: session?.user?.id === comment.authorId,
      likeCount: comment._count.likes,
      replyCount: comment._count.replies,
      isLiked: comment.likes && comment.likes.length > 0,
    }));

    return {
      comments: transformedComments,
      total,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

// Update the getCommentReplies function to include the videoId parameter
// Replace the existing getCommentReplies function with this improved version:

export async function getCommentReplies(parentId: string) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { blogId: true },
    });

    if (!comment) {
      throw new Error("Parent comment not found");
    }

    return getComments({ blogId: comment.blogId, parentId });
  } catch (error) {
    console.error("Error fetching comment replies:", error);
    throw new Error("Failed to fetch comment replies");
  }
}

// Update the updateComment function to return the correct data
// Modify the updateComment function to include likes and reply count:

export async function updateComment(commentId: string, content: string) {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("You must be logged in to update a comment");
    }

    // Check if the user is the author of the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        blogId: true,
        parentId: true,
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!existingComment) {
      throw new Error("Comment not found");
    }

    if (existingComment.authorId !== session.user.id) {
      throw new Error("You can only edit your own comments");
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id,
          },
          take: 1,
        },
      },
    });

    const transformedComment: Comment = {
      id: comment.id,
      content: comment.content,
      author: comment.author as Author,
      blogId: comment.blogId,
      parentId: comment.parentId,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isEdited: true,
      isAuthor: true,
      likeCount: comment._count.likes,
      replyCount: comment._count.replies,
      isLiked: comment.likes && comment.likes.length > 0,
    };

    revalidatePath(`/videos/${comment.blogId}`);

    return {
      success: true,
      comment: transformedComment,
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error("Failed to update comment");
  }
}

// Enhance the deleteComment function to properly handle nested comments
// Replace the existing deleteComment function with this improved version:

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("You must be logged in to delete a comment");
    }

    // Check if the user is the author of the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        blogId: true,
        parentId: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== session.user.id) {
      throw new Error("You can only delete your own comments");
    }

    // If this is a parent comment with replies, delete all replies first
    if (comment._count.replies > 0) {
      // Get all reply IDs
      const replies = await prisma.comment.findMany({
        where: { parentId: commentId },
        select: { id: true },
      });

      const replyIds = replies.map((reply) => reply.id);

      // Delete all replies
      await prisma.comment.deleteMany({
        where: { id: { in: replyIds } },
      });
    }

    // Delete the comment itself
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // If this was a reply, update the parent comment's reply count
    if (comment.parentId) {
      await prisma.comment.update({
        where: { id: comment.parentId },
        data: {
          replyCount: {
            decrement: 1,
          },
        },
      });
    }

    revalidatePath(`/videos/${comment.blogId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment");
  }
}

export async function reportComment(commentId: string) {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("You must be logged in to report a comment");
    }

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, blogId: true, authorId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Prevent users from reporting their own content
    if (comment.authorId === session.user.id) {
      throw new Error("You cannot report your own comment");
    }

    // Check if the user has already reported this comment
    const existingReport = await prisma.commentReport.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: session.user.id,
        },
      },
    });

    if (existingReport) {
      throw new Error("You have already reported this comment");
    }

    // Create a report
    await prisma.commentReport.create({
      data: {
        commentId,
        userId:session.user.id,
        reason: "INAPPROPRIATE", // Default reason, could be expanded
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error reporting comment:", error);
    throw new Error("Failed to report comment");
  }
}

// Add like/unlike functionality
export async function likeComment(commentId: string, isLiking: boolean) {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("You must be logged in to like a comment");
    }

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, blogId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (isLiking) {
      // Add like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId: session.user.id,
        },
      });
    } else {
      // Remove like
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId: session.user.id,
          },
        },
      });
    }

    revalidatePath(`/videos/${comment.blogId}`);

    return { success: true };
  } catch (error) {
    // If the error is about a unique constraint, it means the user already liked the comment
    // or tried to unlike a comment they haven't liked
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: false, message: isLiking ? "Already liked" : "Not liked" };
    }

    console.error("Error liking/unliking comment:", error);
    throw new Error(`Failed to ${isLiking ? "like" : "unlike"} comment`);
  }
}
