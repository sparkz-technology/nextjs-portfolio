"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createAsset } from "./action";
import { getFileType } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  folderId: string | null;
  onUploadComplete: () => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
}
const acceptType = `.jpg, .jpeg, .png, .gif, .svg, .webp,
.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv,
.mp4, .webm, .mov, .avi,
.mp3, .wav, .ogg`;
export function FileUploader({ folderId, onUploadComplete, multiple = true, accept=acceptType, maxSize = 10 }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validationSchema = Yup.object({
    files: Yup.mixed()
      .test("required", "Please select at least one file", (value) => {
        const fileList = value as FileList | undefined;
        return fileList !== undefined && fileList.length > 0;
      })
      .test("fileSize", `File size must be less than ${maxSize}MB`, (value) => {
        if (!value) return true;
        const fileList = value as FileList;
        for (let i = 0; i < fileList.length; i++) {
          if (fileList[i].size > maxSize * 1024 * 1024) {
            return false;
          }
        }
        return true;
      }),
  });

  const formik = useFormik({
    initialValues: {
      files: undefined as FileList | undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!values.files || values.files.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      try {
        // Process each file
        for (let i = 0; i < values.files.length; i++) {
          const file = values.files[i];
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            if (file) {
              reader.readAsDataURL(file);
            }
          });

          await createAsset({
            name: file.name,
            type: getFileType(file.name),
            size: file.size,
            url: base64,
            folderId,
          });
        }
        fileInputRef.current!.value = ""; // Clear the file input
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          formik.resetForm();
          onUploadComplete();
        }, 500);
      } catch (error) {
        console.error("Upload error:", error);
        setIsUploading(false);
      }
    },
  });

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      formik.setFieldValue("files", e.dataTransfer.files);
      formik.submitForm();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      formik.setFieldValue("files", e.target.files);
      formik.submitForm();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">Drag and drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          {multiple ? "Upload multiple files" : "Upload a file"}
          {maxSize ? ` (Max size: ${maxSize}MB)` : ""}
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
        />
      </div>

      {formik.errors.files && <p className="text-xs text-destructive">{formik.errors.files as string}</p>}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}
