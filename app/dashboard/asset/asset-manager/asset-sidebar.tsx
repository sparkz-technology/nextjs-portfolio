"use client";

import { FolderPlus, Star, FileImage, FileText, Upload, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FolderTree } from "../folder-tree";
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore";
import { FolderType } from "@/lib/types";

interface AssetSidebarProps {
  folders?: FolderType[];
}

export function AssetSidebar({ folders = [] }: AssetSidebarProps) {
  const {
    currentFolder,
    filterBy,
    setCurrentFolder,
    setFilterBy,
    openUploadDialog: onUpload,
    openNewFolderDialog: onNewFolder,
  } = useAssetManagerStore();

  const handleRenameFolder = (folder: { id: string; name: string }) => {
    useAssetManagerStore.getState().openRenameDialog({ ...folder, type: "folder" });
  };

  const handleDeleteFolder = (folder: { id: string; name: string }) => {
    useAssetManagerStore.getState().openDeleteDialog([{ ...folder, type: "folder" }]);
  };

  return (
    <div className="border-r">
      <div className="p-2 border-b flex items-center gap-1.5">
        <Button
          className="w-full justify-start gap-1.5 text-xs h-7"
          size="sm"
          onClick={onUpload}
          disabled={currentFolder === null}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={onNewFolder}>
          <FolderPlus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-17rem)]">
        <div className="p-1.5">
          <Separator className="my-1.5" />
          <div className="mb-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">Filters</div>
            <div
              className={`flex items-center gap-1 py-0.5 px-2 rounded-md cursor-pointer hover:bg-muted ${
                filterBy === "favorites" ? "bg-muted" : ""
              }`}
              onClick={() => setFilterBy(filterBy === "favorites" ? "all" : "favorites")}
            >
              <Star className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs">Favorites</span>
            </div>
            <div
              className={`flex items-center gap-1 py-0.5 px-2 rounded-md cursor-pointer hover:bg-muted ${
                filterBy === "images" ? "bg-muted" : ""
              }`}
              onClick={() => setFilterBy(filterBy === "images" ? "all" : "images")}
            >
              <FileImage className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs">Images</span>
            </div>
            <div
              className={`flex items-center gap-1 py-0.5 px-2 rounded-md cursor-pointer hover:bg-muted ${
                filterBy === "documents" ? "bg-muted" : ""
              }`}
              onClick={() => setFilterBy(filterBy === "documents" ? "all" : "documents")}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs">Documents</span>
            </div>
            <div
              className={`flex items-center gap-1 py-0.5 px-2 rounded-md cursor-pointer hover:bg-muted ${
                filterBy === "others" ? "bg-muted" : ""
              }`}
              onClick={() => setFilterBy(filterBy === "others" ? "all" : "others")}
            >
              <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs">Others</span>
            </div>
          </div>

          <Separator className="my-1.5" />
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">Folders</div>
          <FolderTree
            showAllFiles
            folders={folders}
            currentFolder={currentFolder}
            onFolderSelect={setCurrentFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
