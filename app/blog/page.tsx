"use client"

import Link from "next/link"
import { Calendar, ArrowRight } from "lucide-react"
import { BlogLikeButton } from "@/app/blog/[slug]/blog-like-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

// Mock data - in a real app, this would come from an API
const posts = [
  {
    id: "1",
    slug: "building-scalable-react-applications",
    title: "Building Scalable React Applications",
    excerpt: "Learn how to structure your React applications for scalability as they grow in size and complexity.",
    createdAt: "2023-10-15T10:30:00Z",
    likes: 24,
    tags: ["React", "Architecture"],
  },
  {
    id: "2",
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices for 2023",
    excerpt:
      "Discover the latest TypeScript patterns and practices that will make your code more maintainable and type-safe.",
    createdAt: "2023-09-22T14:15:00Z",
    likes: 18,
    tags: ["TypeScript", "Best Practices"],
  },
  {
    id: "3",
    slug: "nextjs-app-router-guide",
    title: "Comprehensive Guide to Next.js App Router",
    excerpt: "Everything you need to know about the new App Router in Next.js and how to leverage its power.",
    createdAt: "2023-08-05T09:45:00Z",
    likes: 32,
    tags: ["Next.js", "Web Development"],
  },
]

export function BlogPage() {
  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-xl">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                {post.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              <time dateTime={post.createdAt} className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(post.createdAt)}
              </time>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-muted-foreground">{post.excerpt}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <Link
              href={`/blog/${post.slug}`}
              className="text-sm font-medium text-primary flex items-center hover:underline"
            >
              Read more <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
            <BlogLikeButton postId={post.id} initialLikes={post.likes} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

