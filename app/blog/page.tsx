
import BlogList from "./blog-list";
import { listBlogs } from "./action";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read my latest thoughts on software development, web technologies, and more.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default async function BlogPage() {
  const blogPosts = await listBlogs({});
  
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' }
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 sm:py-24 px-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      <BlogList initialPosts={blogPosts?.data?.blogs || []} />
    </div>
  );
}
