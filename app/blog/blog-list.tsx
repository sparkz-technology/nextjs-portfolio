"use client";
import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { BlogLikeButton } from "@/app/blog/blog-like-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateReadTime} from "@/lib/utils";
import { BlogWithLikeStatus, listBlogs } from "./action";
import BlogShareButton from "./blog-share-button";

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const PAGE_SIZE = 5;
function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return ""
  let text = markdown.replace(/```[\s\S]*?```/g, "")
  text = text.replace(/!\[.*?\]$$.*?$$/g, "")
  text = text.replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
  text = text.replace(/#{1,6}\s+/g, "")
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2")
  text = text.replace(/(\*|_)(.*?)\1/g, "$2")
  text = text.replace(/<[^>]*>/g, "")
  text = text.replace(/\s+/g, " ").trim()
  return text
}
export default function BlogList({ initialPosts }: { initialPosts: BlogWithLikeStatus[] }) {
  const [posts, setPosts] = useState<BlogWithLikeStatus[]>(initialPosts || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const loaderRef = useRef(null);
  const isFetching = useRef(false);

  // Fetch more posts when scrolled to the bottom
  const fetchMore = useCallback(() => {
    if (isFetching.current || !hasMore) return;

    isFetching.current = true;

    // Use startTransition to avoid blocking UI
    startTransition(async () => {
      const newPosts = await listBlogs({
        page: page + 1,
        limit: PAGE_SIZE,
      });

      if (newPosts.data?.blogs?.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...(newPosts.data?.blogs || [])]);
        setPage((prev) => prev + 1);
      }

      isFetching.current = false;
    });
  }, [page, hasMore]);

  // Intersection observer to trigger loading
  useEffect(() => {
    const target = loaderRef.current; // Store ref value in a variable
  
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMore();
        }
      },
      { threshold: 1.0 }
    );
  
    if (target) {
      observer.observe(target);
    }
  
    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [fetchMore, hasMore]);


  return (
    <main className="max-w-2xl mx-auto py-12 sm:py-24 px-6 mb-6">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-muted-foreground mb-4">
        Thoughts, ideas, and insights on software engineering and technology.
      </p>
      <div className="grid gap-4">
        {posts.map((post) => {
        const contentPreview = extractTextFromMarkdown(post.content)
  const truncatedContent = contentPreview.length > 160 ? `${contentPreview.substring(0, 160)}...` : contentPreview
      return(
          <Card
            key={post.id}
            className="flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags?.split(',').map((tag: string) => (
                  <Badge key={tag.trim()} variant="secondary" className="text-xs font-normal">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl">
                <Link href={`/blog/${post.excerpt}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
                         <CardDescription className="text-sm text-muted-foreground flex items-center gap-2">
                <time dateTime={post.createdAt.toISOString()} className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(new Date(post.createdAt))}
                </time>
                <span>|</span>
                <span>{calculateReadTime(contentPreview)} min read</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-muted-foreground">{truncatedContent}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              <Link
                href={`/blog/${post.excerpt}`}
                className="text-sm font-medium text-primary flex items-center hover:underline"
              >
                Read more <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
              <div className="flex items-center space-x-1">
              <BlogLikeButton
                isLoggedIn={post.isLoggedIn}
                postId={post.id}
                initialLikes={post._count?.likes ?? 0}
                isLikedByUser={post.isLikedByUser}
              />
                <BlogShareButton
                postTitle={post.title}
                postExcerpt={post.excerpt || ""}
              />
              </div>
            </CardFooter>
          </Card>
        )})}
      </div>

      {/* Loader or "No more posts" */}
      <div ref={loaderRef} className="text-center py-4">
        {hasMore ? <p>Loading more posts...</p> : <p>No more posts available.</p>}
      </div>
    </main>
  );
}
