"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleGuestSignatureLikeAction } from "./action";
import { toast } from "sonner";
import { sideCannonsConfetti } from "@/lib/utils";

interface LikeButtonProps {
  initialLikes: number;
  initiallyLiked: boolean;
  isLoggedIn: boolean;
  id: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  initialLikes = 0,
  initiallyLiked = false,
  id,
  isLoggedIn = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initiallyLiked);

  const handleLikeToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { success, message } = await toggleGuestSignatureLikeAction({ guestSignatureId: id });
      if (!success) {
        throw new Error(message);
      }
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
      if (isLiked) {
        toast.success("Like removed successfully");
      } else {
        sideCannonsConfetti();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const LikeButtonContent = () => (
    <motion.div
      className="flex items-center gap-2"
      initial="rest"
      animate={isLiked ? "liked" : "rest"}
      whileHover="hover"
    >
      <Button
        variant="unstyled"
        size="sm"
        className="group flex p-0 items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        onClick={handleLikeToggle}
        data-id={id}
        aria-label={isLiked ? "Unlike" : "Like"}
        disabled={isLoading || !isLoggedIn}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <motion.div
            variants={{
              rest: { scale: 1, color: "#6B7280" },
              liked: { scale: 1.2, color: "#EF4444" },
              hover: { scale: 1.1 },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Heart
              className="h-3 w-3"
              style={{
                fill: isLiked ? "currentColor" : "none",
              }}
            />
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          <motion.span
            className="font-medium"
            key={likes}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            {likes}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <LikeButtonContent />
        </div>
      </TooltipTrigger>
      {!isLoggedIn && (
        <TooltipContent>
          <p>Please log in to like this post</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};
