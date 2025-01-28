"use client";

import { Formik, Form, FormikHelpers } from "formik";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { IAsset } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { useAssetDialog } from "@/lib/zustand/use-dialog-store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const DeleteDialog: React.FC = () => {
  const { type, closeDialog, data } = useAssetDialog();

  interface DeleteDialogValues {
    id: string;
  }

  const handleSubmit = async (_values: DeleteDialogValues, { setSubmitting }: FormikHelpers<DeleteDialogValues>) => {
    try {
      const { success, message } = await deleteAssetAction(data?.id ?? "");
      if (!success) throw new Error(message);
      toast.info("Asset deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      closeDialog();
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={type === "deleteAsset"} onOpenChange={closeDialog}>
      <Formik key={type} initialValues={{ id: data?.id ?? "" }} onSubmit={handleSubmit}>
        {({ isSubmitting, submitForm }) => (
          <Form>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <p className="text-lg font-semibold mb-2">Are you sure you want to delete this Asset?</p>
                <p className="text-muted-foreground">
                  This action can be undone. All associated data will be soft deleted.
                </p>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button onClick={closeDialog} variant="outline" type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  variant="destructive"
                  type="submit"
                  onClick={submitForm}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete asset"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";

export const AssetViewDialog: React.FC = () => {
  const { type, closeDialog, data } = useAssetDialog();
  const [copiedField, setCopiedField] = useState<"publicId" | "url" | null>(null);
  const timeOutIdRef = useRef<NodeJS.Timeout | null>(null); // Store timeout ID

  const assetData = data as IAsset;

  const copyToClipboard = async (text: string, field: "publicId" | "url") => {
    if (timeOutIdRef.current) {
      clearTimeout(timeOutIdRef.current); // Clear existing timeout
    }
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    timeOutIdRef.current = setTimeout(() => {
      setCopiedField(null);
    }, 2000); // Set timeout and store ID in the ref
  };

  useEffect(() => {
    return () => {
      if (timeOutIdRef.current) {
        clearTimeout(timeOutIdRef.current); // Clear timeout on component unmount
      }
    };
  }, []);

  return (
    <Dialog open={type === "viewAsset"} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
        <DialogHeader>
          <DialogTitle>{assetData?.name}</DialogTitle>
        </DialogHeader>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {assetData?.type === "image" ? (
              <motion.div
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={assetData.url}
                  alt={assetData.name}
                  width={200}
                  height={300}
                  style={{ objectFit: "contain" }}
                  className="mx-auto"
                />
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <video src={assetData?.url} controls className="max-w-full h-auto mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Public ID:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(assetData?.publicId || "", "publicId")}
              >
                {copiedField === "publicId" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-2">{copiedField === "publicId" ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
            <p className="text-sm text-gray-500 break-all">{assetData?.publicId}</p>
          </motion.div>
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">URL:</p>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(assetData?.url || "", "url")}>
                {copiedField === "url" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2">{copiedField === "url" ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
            <p className="text-sm text-gray-500 break-all">{assetData?.url}</p>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

import { useCallback } from "react";
import * as Yup from "yup";
import { Upload, X } from "lucide-react";

import { DialogTrigger } from "@/components/ui/dialog";
import { deleteAssetAction, uploadAssetAction } from "@/app/dashboard/asset/action";
import { FilePreview } from "@/components/file-preview";

const validationSchema = Yup.object().shape({
  file: Yup.mixed()
    .test("fileSize", "File size is too large (max 5MB)", (value) => {
      if (!value) return true;
      return (value as File).size <= 50000000; // 5MB
    })
    .test("fileType", "Unsupported file type", (value) => {
      if (!value) return true;
      return ["image/jpeg", "image/png", "image/gif", "video/mp4"].includes((value as File).type);
    })
    .required("File is required"),
});

interface FormValues {
  file: File | null;
}

export function UploadAssetDialog() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const initialValues: FormValues = {
    file: null,
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    if (values.file) {
      try {
        const formData = new FormData();
  
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          if (values.file) {
            reader.readAsDataURL(values.file);
          }
        });
        formData.append("fileName", values.file.name);
        formData.append("fileType", values.file.type);
        formData.append("file", base64);
        const { message, success } = await uploadAssetAction(formData);
        if (!success) throw new Error(message);
        toast.success("Asset uploaded successfully");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setSubmitting(false);
        resetForm();
        setPreview(null);
        setOpen(false);
      }
    }
  };

  const handleFileChange = (file: File | null, setFieldValue: (field: string, value: File | null) => void) => {
    if (file) {
      setFieldValue("file", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFieldValue("file", null);
      setPreview(null);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], setFieldValue: (field: string, value: File | null) => void) => {
    if (acceptedFiles.length > 0) {
      handleFileChange(acceptedFiles[0], setFieldValue);
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    setFieldValue: (field: string, value: File | null) => void
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    onDrop(files, setFieldValue);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Upload Asset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] w-full">
        <DialogHeader>
          <DialogTitle>Upload Asset</DialogTitle>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-gray-500"
          >
            Select an image or video file to upload
          </motion.p>
        </DialogHeader>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ errors, touched, setFieldValue, isSubmitting, values }) => (
            <Form className="space-y-4">
              <motion.div
                ref={dropzoneRef}
                className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-300 ease-in-out ${
                  isDragging ? "border-primary bg-primary/10" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, setFieldValue)}
                animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
              >
                <input
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,image/gif,video/mp4"
                  onChange={(event) => handleFileChange(event.currentTarget.files?.[0] || null, setFieldValue)}
                  ref={fileInputRef}
                  className="hidden"
                />
                {!values.file && (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Drag and drop your file here, or</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-2">
                      <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline">
                        Select File
                      </Button>
                    </motion.div>
                  </div>
                )}
                {values.file && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate w-3/4">{values.file.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange(null, setFieldValue)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
              {errors.file && touched.file && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.file}
                </motion.p>
              )}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FilePreview file={values.file} preview={preview} />
                  </motion.div>
                )}
              </AnimatePresence>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button onClick={() => setOpen(false)} variant="destructive" type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button disabled={isSubmitting || !values.file} type="submit" className="w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload asset"
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
