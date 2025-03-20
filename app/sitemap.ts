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
      url: `${baseUrl}/guestbook`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];
const blogPosts = await listBlogs({limit: 1000});
  const blogRoutes = blogPosts.data?.blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.excerpt}`,
    lastModified: new Date(blog.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
  return [...publicRoutes, ...(blogRoutes || [])];
}
