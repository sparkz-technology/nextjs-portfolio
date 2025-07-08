import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./globals.css";
import SessionProviderClient from "@/components/session-provider-client";
import { AppBackground } from "@/components/app-background";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PersonStructuredData, WebsiteStructuredData } from "@/components/seo/structured-data";
import { PerformanceOptimizer, CriticalCSS } from "@/components/seo/performance-optimizer";



async function getBuildId() {
  return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.BUILD_ID || "development"
}

export async function getSiteMetadata() {
  return prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    // cacheStrategy: { ttl: 60 },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const DATA = await getSiteMetadata();
  const buildId = await getBuildId()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  
  if (!DATA) {
    return{
      metadataBase: new URL(baseUrl || "http://localhost:3000"),
      title: {
        default: "Next.js Starter",
        template: "%s | Next.js Starter",
      },
      other: {
      "build-id": buildId,
      },
      description: "Next.js Starter",
      keywords: ["next.js", "react", "portfolio", "web development"],
      authors: [{ name: "Next.js Starter" }],
      creator: "Next.js Starter",
      publisher: "Next.js Starter",
      alternates: {
        canonical: baseUrl,
      },
      openGraph: {
        title: "Next.js Starter",
        description: "Next.js Starter",
        url: baseUrl,
        siteName: "Next.js Starter",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: `${baseUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: "Next.js Starter",
          },
        ],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      twitter: {
        title: "Next.js Starter",
        card: "summary_large_image",
        creator: "@nextjs",
        images: [
          {
            url: `${baseUrl}/og-image.png`,
            alt: "Next.js Starter",
          },
        ],
      },
      verification: {
        google: "FKMDniF5WlVDC0ppv7xI4TDqbcqLiZjjUH38NJD6B4Q",
        yandex: "",
      },
    }
  }

  const siteUrl = DATA.url || baseUrl;
  const keywords = [
    DATA.name,
    "portfolio",
    "web developer",
    "software engineer",
    "full stack developer",
    "react",
    "next.js",
    "javascript",
    "typescript"
  ].filter(Boolean);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: DATA.name!,
      template: `%s | ${DATA.name}`,
    },
     other: {
      "build-id": buildId,
      },
    description: DATA.description,
    keywords: keywords.join(", "),
    authors: [{ name: DATA.name || "", url: siteUrl }],
    creator: DATA.name || "",
    publisher: DATA.name || "",
    alternates: {
      canonical: siteUrl,
      types: {
        "application/rss+xml": `${siteUrl}/rss.xml`,
      },
    },
    openGraph: {
      title: DATA.name!,
      description: DATA.description!,
      url: siteUrl,
      siteName: DATA.name!,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: DATA.name || "Portfolio",
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    twitter: {
      title: DATA.name!,
      card: "summary_large_image",
      creator: DATA.username || "",
      site: DATA.username || "",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          alt: DATA.name || "Portfolio",
        },
      ],
    },
    verification: {
      google: "",
      yandex: "",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const DATA = await getSiteMetadata();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <CriticalCSS />
        {DATA && (
          <>
            <PersonStructuredData
              name={DATA.name || ""}
              url={DATA.url || baseUrl}
              description={DATA.description || ""}
              image={DATA.avatarUrl || undefined}
              jobTitle={DATA.jobTitle || undefined}
              sameAs={DATA.socialLinks ? Object.values(DATA.socialLinks).filter(Boolean) as string[] : undefined}
            />
            <WebsiteStructuredData
              name={DATA.name || ""}
              url={DATA.url || baseUrl}
              description={DATA.description || ""}
              publisher={{
                name: DATA.name || "",
                url: DATA.url || baseUrl,
              }}
            />
          </>
        )}
      </head>
      <body className={cn("font-sans antialiased")} >
        <PerformanceOptimizer />
        <main className={`min-h-screen bg-background font-sans antialiased `}>
          <SessionProviderClient>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider delayDuration={0}>
                <AppBackground />
                <Toaster richColors position="top-right" pauseWhenPageIsHidden />
                {children}
                <Navbar />
              </TooltipProvider>
            </ThemeProvider>
          </SessionProviderClient>
        </main>
      </body>
    </html>
  );
}
