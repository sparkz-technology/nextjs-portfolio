"use client";

import type React from "react";
import { Download, FileImage, FileText, File, MoreHorizontal, Star, Edit, Trash, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleFavorite } from "./action";
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore";
import type { AssetType } from "@/lib/types";
import { toast } from "sonner";
import Image from "next/image";

interface AssetListProps {
  assets: AssetType[];
  viewMode: "grid" | "list";
  selectedAssets: string[];
  onSelectAsset: (assetId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onPreviewAsset: (asset: AssetType) => void;
  onRenameAsset: (asset: { id: string; name: string }) => void;
  onDeleteAsset: (asset: { id: string; name: string }) => void;
  onShareAsset: (asset: AssetType) => void;
  onDownloadAsset: (asset: AssetType) => void;
  onDownloadSelected: () => void;
}

export function AssetList({
  assets,
  viewMode,
  selectedAssets,
  onSelectAsset,
  onSelectAll,
  onPreviewAsset,
  onRenameAsset,

  onDeleteAsset,
  onShareAsset,
  onDownloadAsset,
}: AssetListProps) {
  const { isTogglingFavorite, isDownloadingAsset, setTogglingFavorite  } = useAssetManagerStore();

  const handleToggleFavorite = async (assetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTogglingFavorite(assetId, true);

    const result = await toggleFavorite(assetId);

    if (!result.success) {
      toast.error("Failed to toggle favorite");
    
    }
  
    setTogglingFavorite(assetId, false);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <FileImage className="h-3.5 w-3.5" />;
      case "document":
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <File className="h-3.5 w-3.5" />;
    }
  };

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <File className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-base font-medium">No files found</h3>
        <p className="text-xs text-muted-foreground mt-1">Upload files to get started</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className={`border rounded-md overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group relative ${
              selectedAssets.includes(asset.id) ? "border-primary ring-1 ring-primary" : ""
            }`}
          >
            <div
              className="absolute top-1 left-1 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAsset(asset.id, !selectedAssets.includes(asset.id));
              }}
            >
              <Checkbox
                checked={selectedAssets.includes(asset.id)}
                className="h-3.5 w-3.5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>

            <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadAsset(asset);
                    }}
                  >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareAsset(asset);
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5 mr-2" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(asset.id);
                    }}
                  >
                    <Star className={`h-3.5 w-3.5 mr-2 ${asset.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    <span>{asset.favorite ? "Remove favorite" : "Add to favorites"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameAsset({ id: asset.id, name: asset.name });
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAsset({ id: asset.id, name: asset.name });
                    }}
                  >
                    <Trash className="h-3.5 w-3.5 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div
              className="absolute top-1 right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(asset.id);
              }}
            >
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isTogglingFavorite[asset.id]}>
                {isTogglingFavorite[asset.id] ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Star className={`h-3.5 w-3.5 ${asset.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                )}
              </Button>
            </div>

            <div
              className="aspect-square bg-muted/50 flex items-center justify-center"
              onClick={() => onPreviewAsset(asset)}
            >
              {asset.type === "image" ? (
                <Image
                height={100}
                width={100}
                src={asset.url || "/placeholder.svg"} alt={asset.name} className="object-cover w-full h-full" />
              ) : (
                <div className="text-3xl text-muted-foreground">{getFileIcon(asset.type)}</div>
              )}
            </div>
            <div className="p-1.5">
              <div className="flex items-center gap-1">
                {getFileIcon(asset.type)}
                <span className="text-xs font-medium truncate">{asset.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{asset.sizeFormatted}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-1.5 px-2 text-left w-8">
              <Checkbox
                checked={selectedAssets.length > 0 && selectedAssets.length === assets.length}
                onCheckedChange={onSelectAll}
                className="h-3.5 w-3.5"
              />
            </th>
            <th className="py-1.5 px-2 text-left w-8"></th>
            <th className="text-left py-1.5 px-2 font-medium">Name</th>
            <th className="text-left py-1.5 px-2 font-medium">Size</th>
            <th className="text-left py-1.5 px-2 font-medium">Modified</th>
            <th className="text-right py-1.5 px-2 font-medium w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className={`border-b hover:bg-muted/50 cursor-pointer ${
                selectedAssets.includes(asset.id) ? "bg-muted/30" : ""
              }`}
              onClick={() => onSelectAsset(asset.id, !selectedAssets.includes(asset.id))}
            >
              <td className="py-1.5 px-2">
                <Checkbox
                  checked={selectedAssets.includes(asset.id)}
                  className="h-3.5 w-3.5"
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
              <td className="py-1.5 px-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(asset.id);
                  }}
                  disabled={isTogglingFavorite[asset.id]}
                >
                  {isTogglingFavorite[asset.id] ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Star className={`h-3.5 w-3.5 ${asset.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  )}
                </Button>
              </td>
              <td className="py-1.5 px-2">
                <div className="flex items-center gap-1.5">
                  {getFileIcon(asset.type)}
                  <span className="text-xs">{asset.name}</span>
                </div>
              </td>
              <td className="py-1.5 px-2 text-xs text-muted-foreground">{asset.sizeFormatted}</td>
              <td className="py-1.5 px-2 text-xs text-muted-foreground">
                {new Date(asset.updatedAt).toLocaleDateString()}
              </td>
              <td className="py-1.5 px-2 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadAsset(asset);
                    }}
                    disabled={isDownloadingAsset[asset.id]}
                  >
                    {isDownloadingAsset[asset.id] ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareAsset(asset);
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRenameAsset({ id: asset.id, name: asset.name });
                        }}
                      >
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAsset({ id: asset.id, name: asset.name });
                        }}
                      >
                        <Trash className="h-3.5 w-3.5 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
