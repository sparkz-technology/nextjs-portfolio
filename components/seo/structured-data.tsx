"use client";

interface PersonStructuredDataProps {
  name: string;
  url: string;
  description: string;
  image?: string;
  jobTitle?: string;
  sameAs?: string[];
}

interface ArticleStructuredDataProps {
  headline: string;
  description: string;
  author: {
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
  tags?: string[];
}

interface WebsiteStructuredDataProps {
  name: string;
  url: string;
  description: string;
  publisher: {
    name: string;
    url: string;
  };
}

export function PersonStructuredData({ 
  name, 
  url, 
  description, 
  image, 
  jobTitle, 
  sameAs 
}: PersonStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    description,
    ...(image && { image }),
    ...(jobTitle && { jobTitle }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function ArticleStructuredData({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  url,
  image,
  tags
}: ArticleStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    author: {
      "@type": "Person",
      name: author.name,
      ...(author.url && { url: author.url }),
    },
    datePublished,
    dateModified,
    url,
    ...(image && { 
      image: {
        "@type": "ImageObject",
        url: image,
      }
    }),
    ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
    publisher: {
      "@type": "Person",
      name: author.name,
      ...(author.url && { url: author.url }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebsiteStructuredData({
  name,
  url,
  description,
  publisher
}: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    publisher: {
      "@type": "Person",
      name: publisher.name,
      url: publisher.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}