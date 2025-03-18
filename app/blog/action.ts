import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Blog, User } from "@prisma/client";

// Define a type for the blog input
export type BlogInput = {
  title: string;
  excerpt: string;
  content: string;
  tags?: string[];
  published?: boolean;
};

// Extend Blog type to include additional computed properties
export type BlogWithLikeStatus = Blog & {
  isLikedByUser: boolean;
  _count: {
    likes: number;
  };
  author?: Pick<User, "id" | "name" | "username" | "avatarUrl">;
  isLoggedIn: boolean;
};

// Standardized response type
export type ResponseType<T> = {
  success: boolean;
  message: string;
  data?: T;
};

// Response type for listing blogs
export type BlogsResponseType = ResponseType<{
  blogs: BlogWithLikeStatus[];
  totalCount: number;
  totalPages: number;
}>;

// Response type for a single blog
export type BlogResponseType = ResponseType<BlogWithLikeStatus | null>;

// Response type for toggling blog likes
export type LikeResponseType = ResponseType<{
  liked: boolean;
  likesCount: number;
}>;

export async function toggleBlogLike(
  blogId: string,
): Promise<LikeResponseType> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, message: "User is not authenticated" };
    }
    // Check if the user has already liked this blog
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    // Toggle the like (add or remove)
    if (existingLike) {
      await prisma.blogLike.delete({
        where: {
          userId_blogId: {
            userId,
            blogId,
          },
        },
      });
    } else {
      await prisma.blogLike.create({
        data: {
          user: { connect: { id: userId } },
          blog: { connect: { id: blogId } },
        },
      });
    }

    // Fetch the updated likes count
    const likesCount = await prisma.blogLike.count({
      where: { blogId },
    });

    return {
      success: true,
      message: existingLike
        ? "Blog unliked successfully"
        : "Blog liked successfully",
      data: {
        liked: !existingLike,
        likesCount,
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while toggling blog like.";
    return { success: false, message: errorMessage };
  }
}

export async function listBlogs({
  page = 1,
  limit = 10,
  authorId,
  tag,
  publishedOnly = true,
}: {
  page?: number;
  limit?: number;
  authorId?: string;
  tag?: string;
  publishedOnly?: boolean;
}): Promise<BlogsResponseType> {
  try {
    const skip = (page - 1) * limit;
    const session = await auth();
    const userId = session?.user?.id;

    // Define filtering criteria
    const where: {
      authorId?: string;
      tags?: { has: string };
      published?: boolean;
    } = {};

    if (authorId) where.authorId = authorId;
    if (tag) where.tags = { has: tag };
    if (publishedOnly) where.published = true;

    // Get total count for pagination
    const totalCount = await prisma.blog.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch blogs with author and like count
    const blogs = await prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    // Fetch liked status for the current user
    const userLikes: Record<string, boolean> = userId
      ? (
        await prisma.blogLike.findMany({
          where: {
            userId,
            blogId: { in: blogs.map((blog) => blog.id) },
          },
          select: { blogId: true },
        })
      ).reduce((acc, like) => {
        acc[like.blogId] = true;
        return acc;
      }, {} as Record<string, boolean>)
      : {};

    // Attach like status to each blog
    const blogsWithLikeStatus: BlogWithLikeStatus[] = blogs.map((blog) => ({
      ...blog,
      isLikedByUser: !!userLikes[blog.id],
      isLoggedIn: !!userId,
    }));

    return {
      success: true,
      message: "Blogs retrieved successfully",
      data: { blogs: blogsWithLikeStatus, totalCount, totalPages },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while listing blogs.";
    return { success: false, message: errorMessage };
  }
}
