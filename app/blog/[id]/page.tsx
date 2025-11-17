import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { BlogLikeButton } from "@/app/blog/blog-like-button";
import { calculateReadTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import type { Blog } from "@prisma/client";
import { auth } from "@/lib/auth";
import MarkdownPreview from "@/components/markdown-preview";
import type { Metadata } from "next/types";
import BackToTop from "@/components/back-to-top";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BlogShareButton from "../blog-share-button";

export type BlogWithLikeStatus = Blog & {
  isLikedByUser: boolean;
  _count?: {
    likes: number;
  };
  author?: {
    id: string;
    name: string | null;
    username: string;
    avatarUrl: string | null;
  };
  likes: number;
  isLoggedIn: boolean;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return "";
  let text = markdown.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/!\[.*?\]$$.*?$$/g, "");
  text = text.replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1");
  text = text.replace(/#{1,6}\s+/g, "");
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/<[^>]*>/g, "");
  text = text.replace(/\s+/g, " ").trim();

  return text;
}
async function getBlog(excerpt: string): Promise<BlogWithLikeStatus | null> {
  try {
    const session = await auth();

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
    });

    if (!blog) {
      return null;
    }

    let isLikedByUser = false;
    let isLoggedIn = false;

    if (session?.user?.id) {
      isLoggedIn = true;
      const like = await prisma.blogLike.findUnique({
        where: {
          userId_blogId: {
            userId: session.user.id,
            blogId: blog.id,
          },
        },
      });

      isLikedByUser = !!like;
    }

    return {
      ...blog,
      likes: blog._count?.likes || 0,
      isLikedByUser,
      isLoggedIn,
    };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get the blog post
  const { id } = await params;
  const post = await getBlog(id);

  if (!post) {
    return {};
  }

  const contentPreview = extractTextFromMarkdown(post.content);
  const truncatedContent =
    contentPreview.length > 160
      ? `${contentPreview.substring(0, 160)}...`
      : contentPreview;
  return {
    title: post.title,
    description: truncatedContent,
    keywords: post.tags,
    authors: post.author
      ? [{ name: post.author.name || post.author.username }]
      : undefined,
    openGraph: {
      title: post.title,
      description: truncatedContent,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author?.name || post.author?.username,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: truncatedContent,
    },
    other: {
      "article:published_time": post.createdAt.toISOString(),
      "article:modified_time": post.updatedAt.toISOString(),
      "article:author": post.author?.name || post.author?.username || "",
      "article:published": post.published.toString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlog(id);

  if (!post) {
    notFound();
  }
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": extractTextFromMarkdown(post.content).slice(0, 200),
  "image": post.coverImage || post.author?.avatarUrl || undefined,
  "author": {
    "@type": "Person",
    "name": post.author?.name || post.author?.username,
    "url": `https://yourdomain.com/u/${post.author?.username}`,
    "image": post.author?.avatarUrl || undefined,
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Portfolio Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/logo.png",
    },
  },
  "datePublished": post.createdAt.toISOString(),
  "dateModified": post.updatedAt.toISOString(),
  "keywords": post.tags ?? [],
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://yourdomain.com/blog/${post.excerpt}`,
  }
};

  return (
    <main className="max-w-2xl mx-auto py-12 sm:py-24 px-6 mb-6">
      <div className="container max-w-3xl pb-6 space-y-6">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to all posts
        </Link>

        <article className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={post.author?.avatarUrl || "./placeholder.svg"}
                  alt={post.author?.name || ""}
                />
                <AvatarFallback>
                  {post.author?.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {post.author?.name || "Unknown Author"}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDate(post.createdAt)}
                  </time>
                  <span className="mx-1">•</span>
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{calculateReadTime(post.content)} min read</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <BlogLikeButton
                isLoggedIn={post.isLoggedIn}
                postId={post.id}
                initialLikes={post.likes}
                isLikedByUser={post.isLikedByUser}
              />
              <BlogShareButton
                postTitle={post.title}
                postExcerpt={post.excerpt}
              />
            </div>
          </div>

          <MarkdownPreview source={post.content} />
        </article>
        <BackToTop />
      </div>
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>

    </main>
  );
}
