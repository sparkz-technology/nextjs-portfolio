
import BlogList from "./blog-list";
import { listBlogs } from "./action";

export default async function BlogPage() {
  const blogPosts = await listBlogs({});
  return <BlogList initialPosts={blogPosts?.data?.blogs || []} />;
}
