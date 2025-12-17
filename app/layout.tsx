import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import SessionProviderClient from "@/components/session-provider-client";
import { AppBackground } from "@/components/app-background";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Background } from "@/components/background";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
  if (!DATA) {
    return{
      metadataBase: new URL(""),
      title: {
        default: "Next.js Starter",
        template: "%s | Next.js Starter",
      },
      other: {
      "build-id": buildId,
      },
      description: "Next.js Starter",
      openGraph: {
        title: "Next.js Starter",
        description: "Next.js Starter",
        url: "",
        siteName: "Next.js Starter",
        locale: "en_US",
        type: "website",
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
      },
      verification: {
        google: "FKMDniF5WlVDC0ppv7xI4TDqbcqLiZjjUH38NJD6B4Q",
        yandex: "",
      },
    }
  }

  return {
    metadataBase: new URL(DATA.url!),
    title: {
      default: DATA.name!,
      template: `%s | ${DATA.name}`,
    },
     other: {
      "build-id": buildId,
      },
    description: DATA.description,
    openGraph: {
      title: DATA.name!,
      description: DATA.description!,
      url: DATA.url!,
      siteName: DATA.name!,
      locale: "en_US",
      type: "website",
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
    },
    verification: {
      google: "",
      yandex: "",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable)} >
        <main className={`min-h-screen bg-background font-sans antialiased `}>
          <SessionProviderClient>
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider delayDuration={0}>
                {/* <AppBackground /> */}
                  <Background src="/alt.mp4" placeholder="/alt-placeholder.png" />
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

