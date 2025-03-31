import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"

// Extend the Blog type to ensure tags are properly typed

// Image metadata
export const alt = "Blog post thumbnail"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

// Simple function to extract plain text from markdown
function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return ""

  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, "")

  // Remove images
  text = text.replace(/!\[.*?\]$$.*?$$/g, "")

  // Remove links but keep the text
  text = text.replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")

  // Remove headers
  text = text.replace(/#{1,6}\s+/g, "")

  // Remove bold/italic markers
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2")
  text = text.replace(/(\*|_)(.*?)\1/g, "$2")

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, "")

  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim()

  return text
}

export default async function Image({ params }: { params: { id: string } }) {
  // Fetch the blog post data
  const blog = await prisma.blog.findFirst({
    where: { excerpt: params.id },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          avatarUrl : true,
        },
      },
    },
  })

  // If no blog post is found, return a default image
  if (!blog) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: "bold" }}>Blog Post Not Found</div>
      </div>,
      { ...size },
    )
  }

  // Format the date
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get the author name or username
  const authorName = blog.author?.name || blog.author?.username || "Anonymous"

  // Extract tags for display
  const tags = blog?.tags
    ? Array.isArray(blog.tags)
      ? blog.tags.slice(0, 3)
      : typeof blog.tags === "string"
        ? (blog.tags as string).split(",").slice(0, 3)
        : []
    : []

  // Extract content preview from markdown
  const contentPreview = extractTextFromMarkdown(blog.content)
  const truncatedContent = contentPreview.length > 160 ? `${contentPreview.substring(0, 160)}...` : contentPreview

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        background: "#000000",
        color: "#ffffff",
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: "10px", background: "#ffffff" }} />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          flex: 1,
        }}
      >
        {/* Top section with title and excerpt */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px" }}>
              {tags.map((tag, index) => (
                <div
                  key={index}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {tag.trim()}
                </div>
              ))}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              lineHeight: 1.1,
              color: "#ffffff",
              letterSpacing: "-0.025em",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            {blog.title}
          </div>

          {/* Content preview */}
          <div
            style={{
              fontSize: "22px",
              lineHeight: 1.5,
              color: "#e0e0e0",
              maxWidth: "90%",
              padding: "20px",
              background: "rgba(30, 30, 30, 0.7)",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {truncatedContent}
          </div>
        </div>

        {/* Bottom section with author and date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Author info */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Avatar placeholder */}
{/*             <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "9999px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000000",
                fontSize: "20px",
                fontWeight: "bold",
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
              }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div> */}
{blog.author?.avatarUrl ? (
  /* eslint-disable @next/next/no-img-element */
    <img
      src={blog.author.avatarUrl}
      alt={authorName}
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "9999px",
        objectFit: "cover",
        boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
      }}
    />
  ) : (
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "9999px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#000000",
        fontSize: "20px",
        fontWeight: "bold",
        boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
      }}
    >
      {authorName.charAt(0).toUpperCase()}
    </div>
  )}

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#ffffff" }}>{authorName}</div>
              <div style={{ fontSize: "16px", color: "#a0a0a0" }}>{formattedDate}</div>
            </div>
          </div>

          {/* Blog branding */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#000000",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#ffffff",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            My Blog
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  )
}
