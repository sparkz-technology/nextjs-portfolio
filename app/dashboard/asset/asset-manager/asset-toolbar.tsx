"use client";

import {
  ArrowDown,
  ArrowUp,
  Download,
  FileArchiveIcon as ZipIcon,
  Folder,
  Grid3X3,
  List,
  Search,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore";
import type { SortOption } from "@/lib/types";
import { downloadFilesAsZip } from "@/lib/cloudinary";
import { toast } from "sonner";

export function AssetToolbar() {
  const {
    assets,
    selectedAssets,
    viewMode,
    sortBy,
    sortDirection,
    searchQuery,
    isDownloadingSelected,
    setViewMode,
    setSelectedAssets,
    setSortBy,
    setDownloadingSelected,
    toggleSortDirection,
    openMoveDialog: onMoveSelected,
    openDeleteDialog,
    setSearchQuery,
  } = useAssetManagerStore();
  const handleDownloadSelected = async () => {
    if (selectedAssets.length === 0) return;
    // Set loading state for bulk download
    console.log(
      "Downloading selected assets...",
      selectedAssets.map((id) => assets.find((a) => a.id === id))
    );
    if (selectedAssets.length ==1){
      const asset = assets.find((a) => a.id === selectedAssets[0]);
      if (!asset?.publicId) {
        toast.error("No public ID found for the selected asset");
        return;
      }
      const url = asset.url;
      const name = asset.name;
      const blob = await fetch(url).then((response) => response.blob());
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      toast.success("Asset downloaded successfully");
      return;
    }
    const publicIds = selectedAssets
      .map((id) => assets.find((a) => a.id === id))
      .filter(
        (asset) => !!asset?.publicId && (asset.type === "image" || asset.type === "video" || asset.type === "raw")
      )
      .map((asset) => ({
        url: asset?.url ?? "",
        name: asset?.name ?? "",
      }));
    if (!publicIds) return;
    setDownloadingSelected(true);

    try {
      const { success, data ,error } = await downloadFilesAsZip(publicIds);
      if (!success) {
        throw new Error(error)
      }
      if (!data) {
        toast.error("No data received");
        return;
      }
      const zipBase64 = data.split(",")[1]; 

      const byteCharacters = atob(zipBase64); 
      const byteArray = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: "application/zip" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "downloaded-files.zip"; 
      link.click(); 
      toast.success("Assets downloaded successfully");
    } catch (error) {
      toast.error("Failed to download assets");
    }

    
      setDownloadingSelected(false);
      setSelectedAssets([]);
  };

  const handleDeleteSelected = () => {
    if (selectedAssets.length === 0) return;

    const itemsToDelete = selectedAssets.map((id) => {
      const asset = assets.find((a) => a.id === id)!;
      return { id, name: asset.name, type: "file" as const };
    });

    openDeleteDialog(itemsToDelete);
  };
  return (
    <div className="p-2 border-b flex items-center justify-between gap-2">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search files..."
          className="pl-7 h-7 text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1.5">
        {selectedAssets.length > 0 && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={handleDownloadSelected}
              disabled={isDownloadingSelected}
            >
              {isDownloadingSelected ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                  {selectedAssets.length > 1 ? "Creating ZIP..." : "Downloading..."}
                </>
              ) : (
                <>
                  {selectedAssets.length > 1 ? (
                    <>
                      <ZipIcon className="h-3.5 w-3.5" />
                      Download ZIP
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </>
                  )}
                </>
              )}
            </Button>

            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={onMoveSelected}>
              <Folder className="h-3.5 w-3.5" />
              Move
            </Button>

            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleDeleteSelected}>
              <Trash className="h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        )}

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={toggleSortDirection}>
          {sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
        </Button>

        <TooltipProvider>
          <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList className="h-7">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="grid" className="px-2 h-7">
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="list" className="px-2 h-7">
                    <List className="h-3.5 w-3.5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </TooltipProvider>
      </div>
    </div>
  );
}
