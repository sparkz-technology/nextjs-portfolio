import * as FadeIn from "@/components/motion";
import { AuthButtons } from "@/app/guestbook/auth-buttons";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSiteMetadata } from "../layout";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const DATA = await getSiteMetadata();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (!DATA) {
    return {
      metadataBase: new URL(baseUrl || "http://localhost:3000"),
      title: "Guestbook",
      description: "Leave a message in my portfolio's guestbook. Share your thoughts, feedback, or just say hello!",
      alternates: {
        canonical: `${baseUrl}/guestbook`,
      },
      openGraph: {
        title: "Guestbook",
        description: "Leave a message in my portfolio's guestbook. Share your thoughts, feedback, or just say hello!",
        url: `${baseUrl}/guestbook`,
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
        title: "Guestbook",
        card: "summary_large_image",
      },
    };
  }

  return {
    title: `Guestbook`,
    description: "Leave a message in my portfolio's guestbook. Share your thoughts, feedback, or just say hello!",
    alternates: {
      canonical: `${DATA.url}/guestbook`,
    },
    openGraph: {
      title: `Guestbook`,
      description: "Leave a message in my portfolio's guestbook. Share your thoughts, feedback, or just say hello!",
      url: `${DATA.url}/guestbook`,
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
      title: `Guestbook`,
      card: "summary_large_image",
    },
  };
}

export default async function GuestLayout({ children }: GuestLayoutProps) {
  const session = await auth();
  
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Guestbook', url: '/guestbook' }
  ];

  return (
    <main className="max-w-2xl mx-auto py-12 sm:py-24 px-6">
      <FadeIn.Container>
        <FadeIn.Item>
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <div className="space-y-4">
            <h1 className="font-medium text-2xl tracking-tighter">Sign my guestbook</h1>
            <div className="flex w-full justify-between items-center">
              <AuthButtons session={session} />
            </div>
          </div>
        </FadeIn.Item>

        <FadeIn.Item>
          <div className="space-y-4">{children}</div>
        </FadeIn.Item>
      </FadeIn.Container>
    </main>
  );
}
