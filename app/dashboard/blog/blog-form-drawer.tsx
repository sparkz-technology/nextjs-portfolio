"use client"

import type React from "react"
import { useState, useEffect, type ReactNode } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for editing
const postData = {
  "1": {
    title: "Building Scalable React Applications",
    content: "# React Scaling Tips\n\nUse atomic design, feature-based structures, and memoization.",
    published: true,
  },
  "2": {
    title: "TypeScript Best Practices for 2023",
    content: "# TypeScript in 2023\n\nUse strict mode, type inference, and utility types.",
    published: true,
  },
}

type BlogFormDrawerProps = {
  children?: ReactNode
  postId?: string
}

export function BlogFormDrawer({ children, postId }: BlogFormDrawerProps) {
  const [open, setOpen] = useState(false) // Added open state
  const isEditing = !!postId

  const initialValues = {
    title: "",
    content: "",
    published: true,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required").min(5, "Must be at least 5 characters"),
    content: Yup.string().required("Content is required").min(20, "Must be at least 20 characters"),
    published: Yup.boolean(),
  })

  useEffect(() => {
    if (postId && open) {
      const post = postData[postId as keyof typeof postData]
      if (post) {
        setOpen(true) // Open only if post exists
      }
    }
  }, [postId, open])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] sm:max-w-full">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Edit your blog post here. Click save when you're done."
              : "Create a new blog post for your portfolio."}
          </SheetDescription>
        </SheetHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            console.log("Form Data:", values)
            setSubmitting(false)
            setOpen(false) // Close after submission
            resetForm()
          }}
          enableReinitialize
        >
          {({ setFieldValue }) => (
            <Form className="space-y-6 py-4">
              <div className="grid gap-4">
                {/* Title Field */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Field as={Input} id="title" name="title" placeholder="Enter post title" required />
                  <ErrorMessage name="title" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Content Field */}
                <div className="grid gap-2 w-full">
                  <Label htmlFor="content">Content (Markdown)</Label>
                  <Tabs defaultValue="write">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="write" className="mt-2">
                      <Field as={Textarea} id="content" name="content" placeholder="Write your post in Markdown..." className="min-h-[300px] resize-y" required />
                      <ErrorMessage name="content" component="p" className="text-red-500 text-sm" />
                    </TabsContent>

                    <TabsContent value="preview" className="mt-2">
                      <div className="border rounded-md min-h-[300px] p-4 prose dark:prose-invert max-w-none overflow-auto">
                        <Field name="content">
                          {({ field }: { field: { value: string } }) => (field.value ? renderMarkdown(field.value) : <p className="text-muted-foreground">Preview will appear here...</p>)}
                        </Field>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Published Switch */}
                <div className="flex items-center space-x-2">
                  <Switch id="published" name="published" onCheckedChange={(value) => setFieldValue("published", value)} />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>
              </div>

              {/* Form Buttons */}
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                </SheetClose>
                <Button type="submit"> {isEditing ? "Save Changes" : "Create Post"} </Button>
              </SheetFooter>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  )
}

function renderMarkdown(content: string) {
  const sections = content.split("\n\n")

  return (
    <>
      {sections.map((section, index) => {
        if (section.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-6">
              {section.substring(2)}
            </h1>
          )
        } else if (section.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-bold mt-5">
              {section.substring(3)}
            </h2>
          )
        } else if (section.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc pl-5 my-3">
              {section.split("\n").map((item, i) => (
                <li key={i}>{item.substring(2)}</li>
              ))}
            </ul>
          )
        } else {
          return (
            <p key={index} className="my-3">
              {section}
            </p>
          )
        }
      })}
    </>
  )
}
