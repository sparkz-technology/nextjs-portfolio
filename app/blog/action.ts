import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Blog } from "@prisma/client"

export type BlogInput = {
    title: string
    excerpt: string
    content: string
    tags?: string[]
    published?: boolean
}

export type BlogWithLikeStatus = Blog & {
    isLikedByUser: boolean
    _count?: {
        likes: number
    }
    author?: {
        id: string
        name: string | null
        username: string
        avatarUrl: string | null
    }
}

export type ResponseType = {
    success: boolean
    message: string
    data?: any
}



export type BlogsResponseType = ResponseType & {
    data?: {
        blogs: BlogWithLikeStatus[]
        totalCount: number
        totalPages: number
    }
}

export type BlogResponseType = ResponseType & {
    data?: BlogWithLikeStatus | null
}

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
export async function listBlogs({
    page = 1,
    limit = 10,
    authorId,
    tag,
    publishedOnly = true,
}: {
    page?: number
    limit?: number
    authorId?: string
    tag?: string
    publishedOnly?: boolean
}): Promise<BlogsResponseType> {
    try {
        const skip = (page - 1) * limit
        const userId = await auth().then((session) => session?.user?.id)
        // Build the where clause based on filters
        const where: any = {}

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
            likes: blog._count?.likes || 0,
            isLikedByUser: !!userLikes[blog.id],
        }))

        return {
            success: true,
            message: "Blogs retrieved successfully",
            data: {
                blogs: blogsWithLikeStatus,
                totalCount,
                totalPages,
            },
        }
    } catch (error) {
        const errorMessage = (error as Error)?.message ?? `Error occurred while listing blogs.`
        return { success: false, message: errorMessage }
    }
}
