"use client"

import type React from "react"
import { useState, type ReactNode } from "react"
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik"
import * as Yup from "yup"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import MDEditor from "@uiw/react-md-editor"
import Markdown from "react-markdown"
import { TagInput } from "@/components/ui/tag-input"
import { createBlogAction, updateBlogAction } from "./action"
import { BlogWithLikeStatus } from "@/app/blog/action"
import { useBlogDialog } from "@/lib/zustand/use-dialog-store"

// Mock data for editing

type BlogFormDrawerProps = {
    children?: ReactNode
    post?: BlogWithLikeStatus
}

export function BlogFormDrawer({ children }: BlogFormDrawerProps) {
    const { type, closeDialog, data } = useBlogDialog();

    const [open, setOpen] = useState(false) // Added open state
    const isEditing = !!data?.authorId

    const initialValues = {
        title: "",
        excerpt: "",
        content: "",
        tags: [],
        published: true,
    }

    const validationSchema = Yup.object({
        title: Yup.string()
            .required("Title is required")
            .min(5, "Must be at least 5 characters"),

        excerpt: Yup.string()
            .required("Excerpt is required")
            .min(5, "Must be at least 5 characters"),

        content: Yup.string()
            .required("Content is required")
            .min(20, "Must be at least 20 characters"),

        tags: Yup.array()
            .ensure()
            .min(1, "You can't leave this blank."),

        published: Yup.boolean(),
    });



    return (
        <Sheet open={open || type == "post"} onOpenChange={(isOpen) => { setOpen(isOpen); isOpen && closeDialog() }}>
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
                    initialValues={isEditing ? data : initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        if (isEditing) {
                            await updateBlogAction(values)
                        } else {

                            await createBlogAction(values)
                        }
                        setSubmitting(false)
                        closeDialog()
                        setOpen(false)
                        resetForm()
                    }}
                    enableReinitialize
                >
                    {({ setFieldValue, isSubmitting, values }) => (
                        <Form className="space-y-6 py-4">
                            <div className="grid gap-4">
                                {/* Title Field */}
                                <div className="flex gap-2 items-start w-full">
                                    <div className="grid gap-2 w-full">
                                        <Label htmlFor="title">Title</Label>
                                        <Field as={Input} id="title" name="title" placeholder="Enter post title" required />
                                        <ErrorMessage name="title" component="p" className="text-red-500 text-sm" />
                                    </div>
                                    <div className="grid gap-2 w-full">
                                        <Label htmlFor="title">Excerpt</Label>
                                        <Field as={Input} id="excerpt" name="excerpt" placeholder="Enter post excerpt" required />
                                        <ErrorMessage name="excerpt" component="p" className="text-red-500 text-sm" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Field name="tags">
                                        {({ field }: FieldProps) => (
                                            <TagInput
                                                {...field}
                                                placeholder="Enter a topic"
                                                tags={field.value ?? []}
                                                className='sm:min-w-[450px]'
                                                setTags={(newTags) => {
                                                    setFieldValue("tags", newTags);
                                                }}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage name="tags" component="p" className="text-red-500 text-sm" />

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
                                            <Field name="content">
                                                {({ field }: FieldProps) => (
                                                    <MDEditor
                                                        value={field.value}
                                                        onChange={(value) => setFieldValue("content", value)}
                                                        preview="edit"
                                                        height={200}
                                                        visibleDragbar={false}
                                                        textareaProps={{
                                                            placeholder: "Write your content here...",
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                            <ErrorMessage name="content" component="div" className="text-red-500 text-sm mt-1" />
                                        </TabsContent>

                                        <TabsContent value="preview" className="mt-2">
                                            <div className="border rounded-md min-h-[200px] p-4 prose dark:prose-invert max-w-none overflow-auto">
                                                <Field name="content">
                                                    {({ field }: { field: { value: string } }) => (field.value ? <Markdown className="prose max-w-fit h-[200px] overflow-auto text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
                                                        {field.value}
                                                    </Markdown> : <p className="text-muted-foreground">Preview will appear here...</p>)}
                                                </Field>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Published Switch */}
                                <div className="flex items-center space-x-2">
                                    <Switch id="published" name="published" checked={values.published} onCheckedChange={(value) => setFieldValue("published", value)} />
                                    <Label htmlFor="published">Publish immediately</Label>
                                </div>
                            </div>

                            {/* Form Buttons */}
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                                </SheetClose>
                                <Button type="submit"> {isSubmitting ? "Saving..." : "Save Post"}</Button>
                            </SheetFooter>
                        </Form>
                    )}
                </Formik>
            </SheetContent>
        </Sheet>
    )
}

