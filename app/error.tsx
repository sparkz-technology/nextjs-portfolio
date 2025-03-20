"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <CardTitle className="mt-3 text-center text-2xl font-extrabold text-gray-900 dark:text-gray-500">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-center text-sm text-gray-600">
            We apologize for the inconvenience. Our team has been notified and is working on resolving the issue.
          </p>
          {error.message && <p className="mt-2 text-center text-sm text-red-600">Error details: {error.message}</p>}
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          <Button onClick={() => reset()} className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Try again
          </Button>
          <Link href="/" passHref>
            <Button variant="outline" className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Return to homepage
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
