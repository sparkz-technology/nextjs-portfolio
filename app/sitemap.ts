import { MetadataRoute } from "next";
import { listBlogs } from "./blog/action";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  const publicRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guestbook`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  // Get blog posts with better error handling
  try {
    const blogPosts = await listBlogs({ limit: 1000 });
    const blogRoutes = blogPosts.data?.blogs
      .filter(blog => blog.published) // Only include published posts
      .map((blog) => ({
        url: `${baseUrl}/blog/${blog.excerpt}`,
        lastModified: new Date(blog.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })) || [];

    return [...publicRoutes, ...blogRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return publicRoutes;
  }
}
