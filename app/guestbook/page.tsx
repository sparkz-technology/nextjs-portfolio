import Image from "next/image";
import { Suspense } from "react";
import { format } from "timeago.js";
import { prisma } from "@/lib/prisma";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import Loading from "@/app/guestbook/loading";
import { LoadMore } from "@/app/guestbook/loadmore";
import { LikeButton } from "./like-button";
import { auth } from "@/lib/auth";

const PAGE_SIZE = 6;

export type SignatureQuery = {
  id: string;
  message: string;
  created_at: number;
  signature: string;
  username: string | null;
  isLiked: boolean;
  totalLikes: number;
  isLoggedIn: boolean;
};

const getSignature = async (offset: number) => {
  const session = await auth()
  const userId = session?.user?.id;
  const guestSignatures = await prisma.guestSignature.findMany({
    where: {
      visibility: true,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      message: true,
      signatureUrl: true,
      createdAt: true,
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          likes: true, // Count the number of likes for this signature
        },
      },
      likes: {
        where: {
          userId: userId || undefined, // Filter likes by the current user (optional)
        },
        select: {
          id: true, // Selecting the like ID indicates if the user has liked it
        },
      },
    },
    skip: offset,
    take: PAGE_SIZE,
  });

  return guestSignatures.map((post) => ({
    id: post.id,
    message: post.message,
    created_at: post.createdAt.getTime() / 1000,
    signature: post.signatureUrl,
    username: post.user.username,
    isLiked: post.likes.length > 0,
    totalLikes: post._count.likes,
    isLoggedIn: !!session?.user.id,
  }));
};

const loadMorePosts = async (offset: number) => {
  "use server";

  const signature = await getSignature(offset);
  const nextOffset = signature.length === PAGE_SIZE ? offset + PAGE_SIZE : null;
  return [<PostCards posts={signature} key={offset} />, nextOffset] as const;
};

export default async function GuestbookPage() {
  const initialSignature = await getSignature(0);

  if (initialSignature?.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">No signature found. Be the first to leave a message!</p>
      </Card>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <LoadMore loadMoreAction={loadMorePosts} initialOffset={PAGE_SIZE}>
        <PostCards posts={initialSignature} />
      </LoadMore>
    </Suspense>
  );
}

const PostCards = ({ posts }: { posts: SignatureQuery[] }) => {
  return (
    <ul className="grid grid-cols-12 gap-5 mt-10">
      {posts.map((post) => (
        <li key={post.id} className="flex col-span-12 sm:col-span-6">
          <Card
            className={cn(
              "relative overflow-hidden rounded-xl border px-4 py-2",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transition-all duration-300 ease-in-out"
            )}
          >
            <p className="leading-6 text-gray-900 dark:text-gray-50 line-clamp-3" title={post.message}>
              {post.message}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-col justify-end h-full text-sm">
                <p className="font-bold text-nowrap">@{post.username}</p>
                <p className="text-gray-500 dark:text-gray-400">{format(post.created_at * 1000, "PPP")}</p>
              </div>
              {post.signature && (
                <div className="dark:invert -mb-4 -mr-4">
                  <Image alt="signature" src={post.signature} width={150} height={150} />
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center">
              <LikeButton
                initialLikes={post.totalLikes}
                initiallyLiked={post.isLiked}
                id={post.id}
                isLoggedIn={post.isLoggedIn}
              />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
};
