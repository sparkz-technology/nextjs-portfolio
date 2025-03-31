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
import { toggleFavorite } from "../action";
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore";
import type { AssetType } from "@/lib/types";
import { toast } from "sonner";
import Image from "next/image";

interface AssetGridItemProps {
  asset: AssetType;
  isSelected: boolean;
  onSelect: (assetId: string, selected: boolean) => void;
  onPreview: (asset: AssetType) => void;
  onRename: (asset: { id: string; name: string }) => void;
  onDelete: (asset: { id: string; name: string }) => void;
  onShare: (asset: AssetType) => void;
  onDownload: (asset: AssetType) => void;
}

export function AssetGridItem({
  asset,
  isSelected,
  onSelect,
  onPreview,
  onRename,
  onDelete,
  onShare,
  onDownload,
}: AssetGridItemProps) {
  // Fix the unused variable warning
  // Remove isDownloadingAsset from destructuring if not used
  const { isTogglingFavorite, setTogglingFavorite, setAssets, assets } = useAssetManagerStore();

  const handleToggleFavorite = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTogglingFavorite(asset.id, true);

    const result = await toggleFavorite(asset.id);

    if (!result.success) {
      toast.error(result.error || "Failed to toggle favorite");
    } else {
      const updateAsset = assets.map((a: AssetType) => {
        if (a.id === asset.id) {
          return { ...result.asset };
        }
        return a;
      }) as AssetType[];
      setAssets(updateAsset);
    }
    setTogglingFavorite(asset.id, false);
  };
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <FileImage className="!h-3.5 !w-3.5" size=""/>;
      case "document":
        return <FileText className="!h-3.5 !w-3.5" />;
      default:
        return <File className="!h-3.5 !w-3.5" />;
    }
  };

  return (
    <div
      className={`border rounded-md overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group relative ${
        isSelected ? "border-primary ring-1 ring-primary" : ""
      }`}
    >
      <div
        className="absolute top-1 left-1 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(asset.id, !isSelected);
        }}
      >
        <Checkbox
          checked={isSelected}
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
                onDownload(asset);
              }}
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              <span>Download</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onShare(asset);
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-2" />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(e);
              }}
            >
              <Star className={`h-3.5 w-3.5 mr-2 ${asset.favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
              <span>{asset.favorite ? "Remove favorite" : "Add to favorites"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename({ id: asset.id, name: asset.name });
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-2" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete({ id: asset.id, name: asset.name });
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
          handleToggleFavorite(e);
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

      {/* Replace img with next/image */}
      <div className="aspect-square bg-muted/50 flex items-center justify-center" onClick={() => onPreview(asset)}>
        {asset.type === "image" ? (
          <Image
            width={200}
            height={200}
            src={asset.url || "/placeholder.svg"}
            alt={asset.name}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="text-3xl text-muted-foreground">{getFileIcon(asset.type)}</div>
        )}
      </div>
      <div className="p-1.5">
        <div className="flex items-center gap-1">
          {getFileIcon(asset.type)}
          <span className="text-xs font-medium truncate w-[65%]">{asset.name}</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{asset.sizeFormatted}</div>
      </div>
    </div>
  );
}
