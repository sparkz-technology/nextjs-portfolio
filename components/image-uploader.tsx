"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Upload, X, Eye } from "lucide-react";
import Image from "next/image";

export function ImageUploader({
  onUpload,
  imageUrl,
  onDelete,
  fileName,
}: {
  onUpload: (file: string) => void;
  imageUrl?: string;
  fileName?: string;
  onDelete?: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          onUpload(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onUpload]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onDelete?.();
  }, [onDelete]);

  return (
    <Card className="w-full">
      <CardContent className="p-2">
        <div className="flex items-center space-x-2">
          <div
            className={`relative w-full h-16 bg-muted rounded-md overflow-hidden ${
              isDragging ? "border-2 border-dashed border-primary" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="flex items-center justify-between w-full h-full px-4">
                <span className="text-sm truncate max-w-[calc(70%-80px)]" title={selectedFile?.name ?? fileName}>
                  {selectedFile?.name ?? fileName}
                </span>
                <div className="flex items-center space-x-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" aria-label="View image">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <div className="mt-4 relative h-[300px]">
                        {preview && (
                          <Image
                            src={preview}
                            alt={selectedFile?.name ?? fileName ?? "Uploaded image"}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="ghost" onClick={handleClear} aria-label="Clear selection">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="file-upload-image"
                className="flex items-center justify-center w-full h-full cursor-pointer"
              >
                <Upload className="h-6 w-6 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Drag & drop or click to upload</span>
              </label>
            )}
          </div>
          <input
            ref={inputRef}
            id="file-upload-image"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
