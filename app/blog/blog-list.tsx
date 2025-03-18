
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
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { BlogWithLikeStatus } from "./action";

export default async function BlogList({
  posts,
}: {
  posts: BlogWithLikeStatus[];
}) {
  if (!posts) {
    return notFound();
  }
  return (
    <main className="max-w-2xl mx-auto py-12 sm:py-24 px-6 mb-6">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-muted-foreground mb-4">
        Thoughts, ideas, and insights on software engineering and technology.
      </p>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl">
                <Link
                  href={`/blog/${post.excerpt}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                <time
                  dateTime={post.createdAt.toISOString()}
                  className="flex items-center"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(post.createdAt.toISOString())}
                </time>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              <Link
                href={`/blog/${post.excerpt}`}
                className="text-sm font-medium text-primary flex items-center hover:underline"
              >
                Read more <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
              <BlogLikeButton
                isLoggedIn={post.isLoggedIn}
                postId={post.id}
                initialLikes={post._count?.likes ?? 0}
                isLikedByUser={post.isLikedByUser}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
