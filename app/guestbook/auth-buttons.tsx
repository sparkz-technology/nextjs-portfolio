"use client";

import { signIn, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Icons } from "@/components/icons";
import { SignDialog } from "./sign-dialog";
import { Button } from "@/components/ui/button";
interface AuthButtonsProps {
  session: object | null;
}

export function AuthButtons({ session }: AuthButtonsProps) {
  if (session) {
    return (
      <>
        <SignDialog />
        <Button variant="outline" onClick={() => signOut()} className="ml-4 flex items-center">
          <LogOut className="w-6 h-6 mr-2" />
          Sign out
        </Button>
      </>
    );
  }

  return (
    <Button variant="ghost" className="rounded-full flex items-center animate-shimmer" onClick={() => signIn("github")}>
      <Icons.github className="w-6 h-6 mr-2" />
      Sign in with GitHub
    </Button>
  );
}
