
"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import IconRenderer from "./icon-renderer";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: {
      value: string;
    };
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({ title, href, description, dates, tags, link, image, video, links, className }: Props) {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href || "#"} className="block cursor-pointer">
        <div className="relative h-40 w-full">
          {image && (
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              width={400}
              height={100}
              layout="responsive"
              className={cn(
                "!h-40 overflow-hidden object-fill !w-full object-top transition-opacity duration-300",
                isHovering && video ? "opacity-0" : "opacity-100"
              )}
            />
          )}
          {video && (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className={cn(
                "absolute top-0 left-0 h-full w-full object-cover object-top pointer-events-none transition-opacity duration-300",
                isHovering ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </div>
      </Link>
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">{title}</CardTitle>
          <time className="font-sans text-xs">{dates}</time>
          <div className="hidden font-sans text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
            {description}
          </Markdown>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-2">
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags?.map((tag) => (
              <Badge className="px-1 py-0 text-[10px]" variant="secondary" key={tag}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-2 pb-2">
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-1">
            {links?.map((link, idx) => (
              <Link href={link?.href} key={idx} target="_blank">
                <Badge key={idx} className="flex gap-2 px-2 !py-0 text-[10px]">
                  <IconRenderer iconName={link.icon?.value as string} />
                  {link.type}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
