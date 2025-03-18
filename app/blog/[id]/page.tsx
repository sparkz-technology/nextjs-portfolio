import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Calendar } from "lucide-react"
import { BlogLikeButton } from "@/app/blog/blog-like-button"
import { formatDate } from "@/lib/utils"
// import Markdown from "react-markdown"
import { prisma } from "@/lib/prisma"
import type { Blog } from "@prisma/client"
import { auth } from "@/lib/auth"
import MarkdownPreview from '@uiw/react-markdown-preview';

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
  likes: number
}

async function getBlog(excerpt: string): Promise<BlogWithLikeStatus | null> {
  try {
    const session = await auth()

    const blog = await prisma.blog.findFirst({
      where: { excerpt: excerpt },
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

    if (session?.user?.id) {
      const like = await prisma.blogLike.findUnique({
        where: {
          userId_blogId: {
            userId: session.user.id,
            blogId: blog.id,
          },
        },
      })

      isLikedByUser = !!like
    }

    return {
      ...blog,
      likes: blog._count?.likes || 0,
      isLikedByUser,
    }
  } catch (error) {
    console.error("Error fetching blog:", error)
    return null
  }
}


export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const post = await getBlog(id)

  if (!post) {
    notFound()
  }

  return (
    <main className="max-w-2xl mx-auto py-12 sm:py-24 px-6 mb-6">
      <div className="container max-w-3xl py-6 space-y-6">
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to all posts
        </Link>

        <article className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt.toISOString())}</time>
            </div>

            <BlogLikeButton postId={post.id} initialLikes={post.likes} />
          </div>
          {/* <Markdown  className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            {post.content}
          </Markdown> */}
          <MarkdownPreview
            source="Hello World!"
          />
        </article>
      </div>
    </main>
  )
}

