// "use client"

// import * as React from "react"
// import Image, { type ImageProps } from "next/image"
// import * as AvatarPrimitive from "@radix-ui/react-avatar"

// import { cn } from "@/lib/utils"

// const Avatar = React.forwardRef<
//   React.ElementRef<typeof AvatarPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
// >(({ className, ...props }, ref) => (
//   <AvatarPrimitive.Root
//     ref={ref}
//     className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
//     {...props}
//   />
// ))
// Avatar.displayName = AvatarPrimitive.Root.displayName

// const AvatarImage = React.forwardRef<
//   React.ElementRef<typeof Image>,
//   Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>, "src"> &
//     Pick<ImageProps, "src" | "alt" | "width" | "height">
// >(({ className, src, alt, width = 40, height = 40, ...props }, ref) => (
//   <Image
//     {...props}
//     ref={ref}
//     src={src || "/placeholder.svg"}
//     alt={alt || "Avatar"}
//     width={width}
//     height={height}
//     quality={90}
//     className={cn("aspect-square h-full w-full object-cover", className)}
//     onError={(e) => {
//       ;(e.target as HTMLImageElement).src = "/placeholder.svg"
//     }}
//     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//   />
// ))
// AvatarImage.displayName = "AvatarImage"

// const AvatarFallback = React.forwardRef<
//   React.ElementRef<typeof AvatarPrimitive.Fallback>,
//   React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
// >(({ className, ...props }, ref) => (
//   <AvatarPrimitive.Fallback
//     ref={ref}
//     className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
//     {...props}
//   />
// ))
// AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// export { Avatar, AvatarImage, AvatarFallback }

// "use client"

// import * as React from "react"
// import Image, { type ImageProps } from "next/image"
// import * as AvatarPrimitive from "@radix-ui/react-avatar"

// import { cn } from "@/lib/utils"

// const Avatar = React.forwardRef<
//   React.ElementRef<typeof AvatarPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
// >(({ className, ...props }, ref) => (
//   <AvatarPrimitive.Root
//     ref={ref}
//     className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
//     {...props}
//   />
// ))
// Avatar.displayName = AvatarPrimitive.Root.displayName

// const AvatarImage = React.forwardRef<
//   React.ElementRef<typeof Image>,
//   Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>, "src"> &
//     Pick<ImageProps, "src" | "alt" | "width" | "height">
// >(({ className, src, alt, width = 40, height = 40, ...props }, ref) => (
//   <Image
//     {...props}
//     ref={ref}
//     src={src || "/placeholder.svg"}
//     alt={alt || "Avatar"}
//     width={width}
//     height={height}
//     quality={90}
//     className={cn("aspect-square h-full w-full object-cover", className)}
//     onError={(e) => {
//       ;(e.target as HTMLImageElement).src = "/placeholder.svg"
//     }}
//     sizes="(max-width: 768px) 40px, 40px"
//     priority
//     loading="eager"
//     placeholder="blur"
//     blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4="
//   />
// ))
// AvatarImage.displayName = "AvatarImage"

// const AvatarFallback = React.forwardRef<
//   React.ElementRef<typeof AvatarPrimitive.Fallback>,
//   React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
// >(({ className, ...props }, ref) => (
//   <AvatarPrimitive.Fallback
//     ref={ref}
//     className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
//     {...props}
//   />
// ))
// AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// export { Avatar, AvatarImage, AvatarFallback }

"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }

