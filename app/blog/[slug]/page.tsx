import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Calendar } from "lucide-react"
import { BlogLikeButton } from "@/app/blog/[slug]/blog-like-button"
import { formatDate } from "@/lib/utils"

// Mock data - in a real app, this would come from a database
const posts = [
  {
    id: "1",
    slug: "building-scalable-react-applications",
    title: "Building Scalable React Applications",
    content:
      "# Building Scalable React Applications\n\nReact is a powerful library for building user interfaces, but as your application grows, you need to consider scalability.\n\n## Component Structure\n\nOrganizing your components is crucial for maintainability. Here are some patterns I've found effective:\n\n- Feature-based organization\n- Atomic design principles\n- Container/Presenter pattern\n\n## State Management\n\nChoosing the right state management solution depends on your application's needs:\n\n- Context API for simpler apps\n- Redux for complex state requirements\n- Zustand for a lightweight alternative\n\n## Performance Optimization\n\nAs your app grows, performance becomes increasingly important:\n\n- Use React.memo for expensive components\n- Implement virtualization for long lists\n- Code-splitting to reduce bundle size\n\nBy following these principles, you can build React applications that scale well as your requirements grow.",
    createdAt: "2023-10-15T10:30:00Z",
    likes: 24,
    author: "Sutharsan",
  },
  {
    id: "2",
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices for 2023",
    content:
      "# TypeScript Best Practices for 2023\n\nTypeScript continues to grow in popularity, and for good reason. Here are some best practices to follow in 2023.",
    createdAt: "2023-09-22T14:15:00Z",
    likes: 18,
    author: "Sutharsan",
  },
]

async function getBlogPost(slug: string) {
  // In a real app, this would fetch from an API or database
  const post = posts.find((post) => post.slug === slug)
  if (!post) return null
  return post
}
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function BlogPostPage({ params, searchParams }: Props) {
  const postSlug = (await params).slug

  const post = await getBlogPost(postSlug)

  if (!post) {
    notFound()
  }

  return (
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
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>

          <BlogLikeButton postId={post.id} initialLikes={post.likes} />
        </div>

        <div className="prose dark:prose-invert max-w-none">{renderMarkdown(post.content)}</div>
      </article>
    </div>
  )
}

function renderMarkdown(content: string) {
  // This is a simplified markdown renderer
  // In a real app, you would use a library like react-markdown
  const sections = content.split("\n\n")

  return (
    <>
      {sections.map((section, index) => {
        if (section.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-6">
              {section.substring(2)}
            </h1>
          )
        } else if (section.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-bold mt-5">
              {section.substring(3)}
            </h2>
          )
        } else if (section.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc pl-5 my-3">
              {section.split("\n").map((item, i) => (
                <li key={i}>{item.substring(2)}</li>
              ))}
            </ul>
          )
        } else {
          return (
            <p key={index} className="my-3">
              {section}
            </p>
          )
        }
      })}
    </>
  )
}

