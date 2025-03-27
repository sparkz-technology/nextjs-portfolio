import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Calendar } from "lucide-react"
import { BlogLikeButton } from "@/app/blog/blog-like-button"
import { formatDate } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import type { Blog } from "@prisma/client"
import { auth } from "@/lib/auth"
import MarkdownPreview from "@/components/markdown-preview"
import type { Metadata, ResolvingMetadata } from "next/types"
import BackToTop from "@/components/back-to-top"

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
  isLoggedIn: boolean
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
    let isLoggedIn = false

    if (session?.user?.id) {
      isLoggedIn = true
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
      isLoggedIn,
    }
  } catch (error) {
    console.error("Error fetching blog:", error)
    return null
  }
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  // Get the blog post
  const { id } = await params
  const post = await getBlog(id)

  if (!post) {
    return {}
  }

  const description = post.excerpt

  return {
    title: post.title,
    description: description,
    keywords: post.tags,
    authors: post.author ? [{ name: post.author.name || post.author.username }] : undefined,
    openGraph: {
      title: post.title,
      description: description,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author?.name || post.author?.username,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
    },
    other: {
      "article:published_time": post.createdAt.toISOString(),
      "article:modified_time": post.updatedAt.toISOString(),
      "article:author": post.author?.name || post.author?.username || "",
      "article:published": post.published.toString(),
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
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

            <BlogLikeButton
              isLoggedIn={post.isLoggedIn}
              postId={post.id}
              initialLikes={post.likes}
              isLikedByUser={post.isLikedByUser}
            />
          </div>
          <MarkdownPreview source={post.content} />
        </article>
         <BackToTop />
      </div>
    </main>
  )
}

