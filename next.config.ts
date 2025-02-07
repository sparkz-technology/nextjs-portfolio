// import type { NextConfig } from "next"

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   env: {
//     MONGODB_URI: process.env.MONGODB_URI,
//     JWT_SECRET: process.env.JWT_SECRET,
//     REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
//     GITHUB_ID: process.env.GITHUB_ID,
//     GITHUB_SECRET: process.env.GITHUB_SECRET,
//     NEXTAUTH_URL: process.env.NEXTAUTH_URL,
//     NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
//     CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
//     CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
//     CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
//     CLOUDINARY_URL: process.env.CLOUDINARY_URL,
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//       },
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//     ],
//     domains: ["res.cloudinary.com"],
//   },
//   distDir: "build",
//   experimental: {
//     serverActions: {
//       bodySizeLimit: "10mb",
//     },
//     optimizePackageImports: [
//       "@radix-ui/react-avatar",
//       "@radix-ui/react-checkbox",
//       "@radix-ui/react-collapsible",
//       "@radix-ui/react-dialog",
//       "@radix-ui/react-dropdown-menu",
//       "@radix-ui/react-icons",
//       "@radix-ui/react-label",
//       "@radix-ui/react-popover",
//       "@radix-ui/react-scroll-area",
//       "@radix-ui/react-select",
//       "@radix-ui/react-separator",
//       "@radix-ui/react-slider",
//       "@radix-ui/react-slot",
//       "@radix-ui/react-switch",
//       "@radix-ui/react-tabs",
//       "@radix-ui/react-toast",
//       "@radix-ui/react-toggle",
//       "@radix-ui/react-tooltip",
//       "@radix-ui/react-visually-hidden",
//       "date-fns",
//       "framer-motion",
//       "lucide-react",
//       "react-day-picker",
//       "react-icons",
//       "recharts",
//       "zustand",
//     ],
//     reactCompiler: true,
//   },
//   serverExternalPackages: ["@prisma/client"],
//   productionBrowserSourceMaps: true,
//   generateBuildId: async () => {
//     return process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString()
//   },
//   compress: true,
//   swcMinify: true,
//   output: "standalone",
//   headers: async () => [
//     {
//       source: "/(.*)",
//       headers: [
//         {
//           key: "X-Content-Type-Options",
//           value: "nosniff",
//         },
//         {
//           key: "X-Frame-Options",
//           value: "DENY",
//         },
//         {
//           key: "X-XSS-Protection",
//           value: "1; mode=block",
//         },
//       ],
//     },
//     {
//       source: "/static/(.*)",
//       headers: [
//         {
//           key: "Cache-Control",
//           value: "public, max-age=31536000, immutable",
//         },
//       ],
//     },
//   ],
// }

// export default nextConfig

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress:false,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    domains: ["res.cloudinary.com"],
  },
    headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
      ],
    },
    {
      source: "/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
    generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString()
  },
    experimental: {
    nextScriptWorkers: true,
    reactCompiler: true,
    },
  distDir: "build",
}
export default nextConfig
