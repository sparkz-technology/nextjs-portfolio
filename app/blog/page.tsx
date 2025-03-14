"use client"

import Link from "next/link"
import { Calendar, ArrowRight } from "lucide-react"
import { BlogLikeButton } from "@/app/blog/blog-like-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import BlogList from "./blog-list"
import { listBlogs } from "./action"

// Mock data - in a real app, this would come from an API

export default async function BlogPage() {
    const blogPosts = await listBlogs({})
    return (
        <BlogList posts={blogPosts.data} />
    )
}

