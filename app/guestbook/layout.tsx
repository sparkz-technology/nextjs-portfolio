import * as FadeIn from "@/components/motion";
import { AuthButtons } from "@/app/guestbook/auth-buttons";
import { Metadata } from "next";
import { auth } from "@/lib/auth";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Gustbook",
  description: "Portfolio gustbook",
};

export default async function GuestLayout({ children }: GuestLayoutProps) {
  const session = await auth()

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
