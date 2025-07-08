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
import { ArticleStructuredData } from "@/components/seo/structured-data";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (!post) {
    return {};
  }

  const contentPreview = extractTextFromMarkdown(post.content);
  const truncatedContent =
    contentPreview.length > 160
      ? `${contentPreview.substring(0, 160)}...`
      : contentPreview;
  
  const postUrl = `${baseUrl}/blog/${post.excerpt}`;
  const authorUrl = post.author?.url || `${baseUrl}`;
  
  return {
    title: post.title,
    description: truncatedContent,
    keywords: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags,
    authors: post.author
      ? [{ name: post.author.name || post.author.username, url: authorUrl }]
      : undefined,
    creator: post.author?.name || post.author?.username,
    publisher: post.author?.name || post.author?.username,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: truncatedContent,
      type: "article",
      url: postUrl,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author?.name || post.author?.username,
      tags: Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : undefined,
      images: [
        {
          url: `${baseUrl}/blog/${post.excerpt}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: truncatedContent,
      creator: post.author?.username ? `@${post.author.username}` : undefined,
      images: [
        {
          url: `${baseUrl}/blog/${post.excerpt}/twitter-image`,
          alt: post.title,
        },
      ],
    },
    other: {
      "article:published_time": post.createdAt.toISOString(),
      "article:modified_time": post.updatedAt.toISOString(),
      "article:author": post.author?.name || post.author?.username || "",
      "article:published": post.published.toString(),
      "article:section": "Blog",
      "article:tag": Array.isArray(post.tags) ? post.tags.join(", ") : post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getBlog(id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (!post) {
    notFound();
  }

  const contentPreview = extractTextFromMarkdown(post.content);
  const truncatedContent =
    contentPreview.length > 160
      ? `${contentPreview.substring(0, 160)}...`
      : contentPreview;
  
  const postUrl = `${baseUrl}/blog/${post.excerpt}`;
  const authorUrl = post.author?.url || baseUrl;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: postUrl }
  ];

  return (
    <>
      <ArticleStructuredData
        headline={post.title}
        description={truncatedContent}
        author={{
          name: post.author?.name || post.author?.username || "Anonymous",
          url: authorUrl,
        }}
        datePublished={post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
        url={postUrl}
        image={`${baseUrl}/blog/${post.excerpt}/opengraph-image`}
        tags={Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : undefined}
      />
      <main className="max-w-2xl mx-auto py-12 sm:py-24 px-6 mb-6">
        <div className="container max-w-3xl pb-6 space-y-6">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          
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
    </main>
    </>
  );
}
