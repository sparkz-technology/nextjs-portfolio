import * as FadeIn from "@/components/motion";
import { AuthButtons } from "@/app/guestbook/auth-buttons";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSiteMetadata } from "../layout";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const DATA = await getSiteMetadata();

  if (!DATA) {
    return {
      metadataBase: new URL("https://example.com"), // Replace with your default URL
      title: {
        default: "Next.js Starter",
        template: "%s | Next.js Starter",
      },
      description: "Next.js Starter",
      openGraph: {
        title: "Next.js Starter",
        description: "Next.js Starter",
        url: "https://example.com", // Replace with your default URL
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
    };
  }

  return {
    title: `Sign My Guestbook | ${DATA.name}`,
    description: "Leave a message in my portfolio's guestbook. Share your thoughts, feedback, or just say hello!",
    openGraph: {
      title: `Sign My Guestbook | ${DATA.name}`,
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
  };
}

export default async function GuestLayout({ children }: GuestLayoutProps) {
  const session = await auth();

  return (
    <main className="max-w-2xl mx-auto py-12 sm:py-24 px-6">
      <FadeIn.Container>
        <FadeIn.Item>
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
