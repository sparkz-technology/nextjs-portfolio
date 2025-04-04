"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BlogShareButton({
  postTitle,
  postExcerpt,
}: {
  postTitle: string;
  postExcerpt: string;
}) {
  const [isLoading, setIsLoading] = useState({ share: false });

  /**
   * Handles sharing a post to various platforms
   * Uses Web Share API when available, falls back to platform-specific URLs
   *
   * @param {string} platform - The platform to share to (twitter, facebook, linkedin, or copy)
   */
  const handleShare = async (platform?: string) => {
    if (isLoading.share) return;

    setIsLoading((prev) => ({ ...prev, share: true }));
    const url = `${window.location.origin}/blog/${postExcerpt}`;
    const title = postTitle;
    const text = `Check out this post: ${postTitle}`;

    try {
      // Use Web Share API if available and no specific platform is selected
      if (!platform && navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success("Post has been shared");
        return;
      }

      // Platform-specific sharing
      switch (platform) {
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              url
            )}&text=${encodeURIComponent(title)}`,
            "_blank"
          );
          break;
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
        case "copy":
        default:
          await copyToClipboard(url);
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("There was a problem sharing this post. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, share: false }));
    }
  };

  /**
   * Copies text to clipboard with error handling
   *
   * @param {string} text - The text to copy to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Post link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.success("Please try again or copy the URL manually");
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2 text-muted-foreground"
          aria-label="Share this post"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleShare("twitter")}>
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("facebook")}>
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("linkedin")}>
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("copy")}>
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
