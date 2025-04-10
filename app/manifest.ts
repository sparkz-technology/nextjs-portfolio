import type { MetadataRoute } from 'next'
import { prisma } from "@/lib/prisma";

export async function getMetadata() {
  return prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const data = await getMetadata();
  return {
    name: data?.name ?? 'Next.js PWA',
    short_name: data?.name ?? 'NextPWA',
    description: data?.description ?? 'A Progressive Web App built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
     {
        src: "/vercel_icon_192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/vercel_icon_512x512.png",
        sizes: "512x512",
        type: "image/png",
      },

    ],
  }
}
