import { listBlogs } from "../blog/action";
import { getSiteMetadata } from "../layout";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const siteData = await getSiteMetadata();
  const blogPosts = await listBlogs({ limit: 100 });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteData?.name || "Portfolio Blog"}</title>
    <description>${siteData?.description || "Personal blog and portfolio"}</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>${siteData?.email || ""} (${siteData?.name || ""})</managingEditor>
    <webMaster>${siteData?.email || ""} (${siteData?.name || ""})</webMaster>
    <ttl>60</ttl>
    ${blogPosts.data?.blogs
      .filter(blog => blog.published)
      .map(
        blog => `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <description><![CDATA[${extractTextFromMarkdown(blog.content).substring(0, 200)}...]]></description>
      <link>${baseUrl}/blog/${blog.excerpt}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${blog.excerpt}</guid>
      <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>
      <author>${blog.author?.email || ""} (${blog.author?.name || blog.author?.username || ""})</author>
      ${blog.tags ? blog.tags.split(',').map(tag => `<category><![CDATA[${tag.trim()}]]></category>`).join('') : ''}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=600",
    },
  });
}

function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return "";
  let text = markdown.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/#{1,6}\s+/g, "");
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/<[^>]*>/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export const dynamic = "force-dynamic";