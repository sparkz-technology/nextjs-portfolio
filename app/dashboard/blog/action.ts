"use server";

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Blog } from "@prisma/client"
import { revalidatePath } from "next/cache";

export const deletePostAction = async (id: string) => {
    "use server";
    try {
        if (!id) {
            return { success: false, message: "Id is required" };
        }

        await prisma.blog.delete({ where: { id } })
        await revalidatePath("/dashboard/blog","page");
        return { success: true, message: "Post deleted " };

    } catch (error) {
        const errorMessage = (error as Error)?.message ?? `Error occur while creating Blog.`;
        return { success: false, message: errorMessage };

    }
}


type BlogInput = {
    id?: string
    title: string
    excerpt: string
    content: string
    tags?: string[]
    published?: boolean
}

type BlogWithLikeStatus = Blog & {
    isLikedByUser: boolean
    isLoggedIn: boolean
    _count?: {
        likes: number
    }
}
async function retrieveAuthenticatedSession() {
    const session = await auth()
    return session;
}

interface ResponseType {
    success: boolean;
    message: string;
}

/**
 * Create a new blog post
 */
export async function createBlogAction(blogData: BlogInput): Promise<ResponseType> {
    "use server";
    const session = await retrieveAuthenticatedSession();
    if (!session?.user.id) {
        return { success: false, message: "User is not authenticated" };
    }
    try {
        await prisma.blog.create({
            data: {
                ...blogData,
                tags: blogData.tags || [],
                published: blogData.published || false,
                author: {
                    connect: { id: session.user.id },
                },
            },
        })
        await revalidatePath("/dashboard/blog","page");
        return { success: true, message: "Blog created successfully" };

    } catch (error) {
        const errorMessage = (error as Error)?.message ?? `Error occur while creating Blog.`;
        return { success: false, message: errorMessage };

    }

}

/**
 * Update an existing blog post
 * Only the author can update their blog
 */
export async function updateBlogAction(
    blogData: Partial<BlogInput>,
): Promise<ResponseType> {
    "use server";
    try {
        const session = await retrieveAuthenticatedSession();
        if (!session?.user.id) {
            return { success: false, message: "User is not authenticated" };
        }
        const blog = await prisma.blog.findFirst({
            where: {
                id: blogData.id,
            },
        })

        if (!blog) {
            return { success: false, message: "Blog not found or you are not the author" }
        }

        await prisma.blog.update({
            where: { id: blogData.id },
            data: {
                content: blogData.content || "",
                excerpt: blogData.excerpt || "",
                title: blogData.title || "",
                tags: blogData.tags || [],
                published: blogData.published || false,
                author: {
                    connect: { id: session.user.id },
                },
            }
        })
        await revalidatePath("/dashboard/blog","page");

        return { success: true, message: "Blog updated successfully" }
    } catch (error) {
        const errorMessage = (error as Error)?.message ?? `Error occurred while updating Blog.`
        return { success: false, message: errorMessage }
    }
}

/**
 * Toggle like status for a blog
 * Returns the new like status (true if liked, false if unliked)
 */
export type LikeResponseType = ResponseType & {
    data?: {
        liked: boolean
        likesCount: number
    }
}
export async function toggleBlogLike(blogId: string, userId: string): Promise<LikeResponseType> {
    try {
        // Check if the user has already liked this blog
        const existingLike = await prisma.blogLike.findUnique({
            where: {
                userId_blogId: {
                    userId: userId,
                    blogId: blogId,
                },
            },
        })

        // If like exists, remove it; otherwise, create it
        if (existingLike) {
            await prisma.blogLike.delete({
                where: {
                    userId_blogId: {
                        userId: userId,
                        blogId: blogId,
                    },
                },
            })
        } else {
            await prisma.blogLike.create({
                data: {
                    user: { connect: { id: userId } },
                    blog: { connect: { id: blogId } },
                },
            })
        }

        // Get the updated likes count
        const likesCount = await prisma.blogLike.count({
            where: { blogId: blogId },
        })

        return {
            success: true,
            message: existingLike ? "Blog unliked successfully" : "Blog liked successfully",
            data: {
                liked: !existingLike,
                likesCount,
            },
        }
    } catch (error) {
        const errorMessage = (error as Error)?.message ?? `Error occurred while toggling blog like.`
        return { success: false, message: errorMessage }
    }
}

/**
 * List blogs with pagination, filtering, and like status for the current user
 */
export async function listBlogs({
    userId,
    page = 1,
    limit = 10,
    authorId,
    tag,
    publishedOnly = true,
}: {
    userId?: string
    page?: number
    limit?: number
    authorId?: string
    tag?: string
    publishedOnly?: boolean
}): Promise<{
    blogs: BlogWithLikeStatus[]
    totalCount: number
    totalPages: number
}> {
    const skip = (page - 1) * limit

    // Build the where clause based on filters
    const where: {
        authorId?: string
        tags?: {
            has: string
        }
        published?: boolean
    } = {}

    if (authorId) {
        where.authorId = authorId
    }

    if (tag) {
        where.tags = {
            has: tag,
        }
    }

    if (publishedOnly) {
        where.published = true
    }

    // Get total count for pagination
    const totalCount = await prisma.blog.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    // Get blogs with like counts
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
                select: {
                    likes: true,
                },
            },
        },
    })

    // If userId is provided, check which blogs the user has liked
    let userLikes: Record<string, boolean> = {}

    if (userId) {
        const likes = await prisma.blogLike.findMany({
            where: {
                userId,
                blogId: {
                    in: blogs.map((blog) => blog.id),
                },
            },
            select: {
                blogId: true,
            },
        })

        userLikes = likes.reduce(
            (acc, like) => {
                acc[like.blogId] = true
                return acc
            },
            {} as Record<string, boolean>,
        )
    }

    // Add isLikedByUser flag to each blog
    const blogsWithLikeStatus = blogs.map((blog) => ({
        ...blog,
        isLikedByUser: !!userLikes[blog.id],
        isLoggedIn: !!userId,
    }))

    return {
        blogs: blogsWithLikeStatus,
        totalCount,
        totalPages,
    }
}

/**
 * Get a single blog with like status for the current user
 */
export async function getBlog(blogId: string, userId?: string): Promise<BlogWithLikeStatus | null> {
    const blog = await prisma.blog.findUnique({
        where: { id: blogId },
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
                select: {
                    likes: true,
                },
            },
        },
    })

    if (!blog) {
        return null
    }

    let isLikedByUser = false

    if (userId) {
        const like = await prisma.blogLike.findUnique({
            where: {
                userId_blogId: {
                    userId,
                    blogId,
                },
            },
        })

        isLikedByUser = !!like
    }

    return {
        ...blog,
        isLoggedIn: !!userId,
        isLikedByUser,
    }
}

