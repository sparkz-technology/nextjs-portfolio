"use client";

import type React from "react";

import { Download, FileImage, FileText, File, MoreHorizontal, Star, Edit, Trash, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleFavorite } from "../action";
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore";
import type { AssetType } from "@/lib/types";
import { toast } from "sonner";

interface AssetListItemProps {
  asset: AssetType;
  isSelected: boolean;
  onSelect: (assetId: string, selected: boolean) => void;
  onPreview: (asset: AssetType) => void;
  onRename: (asset: { id: string; name: string }) => void;
  onDelete: (asset: { id: string; name: string }) => void;
  onShare: (asset: AssetType) => void;
  onDownload: (asset: AssetType) => void;
}

export function AssetListItem({
  asset,
  isSelected,
  onSelect,
  onPreview,
  onRename,
  onDelete,
  onShare,
  onDownload,
}: AssetListItemProps) {
  const { isTogglingFavorite, setTogglingFavorite, isDownloadingAsset, setAssets, assets } = useAssetManagerStore();

  const handleToggleFavorite = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTogglingFavorite(asset.id, true);

    const result = await toggleFavorite(asset.id);

    if (!result.success) {
      toast.error(result.error || "Failed to toggle favorite");
    } else {
      try {
        const updateAsset = assets.map((a: AssetType) => {
          console.log(asset.id == a.id);
          if (a.id == asset.id) {
            return { ...result.asset };
          }
          return a;
        }) as AssetType[];
        setAssets(updateAsset);
      } catch (error) {
        console.error("Error updating asset in state:", error);
      }
    }

    setTogglingFavorite(asset.id, false);
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

  return (
    <tr
      className={`border-b hover:bg-muted/50 cursor-pointer ${isSelected ? "bg-muted/30" : ""}`}
      onClick={() => onSelect(asset.id, !isSelected)}
    >
      <td className="py-1.5 px-2">
        <Checkbox checked={isSelected} className="h-3.5 w-3.5" onClick={(e) => e.stopPropagation()} />
      </td>
      <td className="py-1.5 px-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(e);
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
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(asset);
          }}
        >
          {getFileIcon(asset.type)}
          <span className="text-xs">{asset.name}</span>
        </div>
      </td>
      <td className="py-1.5 px-2 text-xs text-muted-foreground">{asset.sizeFormatted}</td>
      <td className="py-1.5 px-2 text-xs text-muted-foreground">{new Date(asset.updatedAt).toLocaleDateString()}</td>
      <td className="py-1.5 px-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(asset);
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
              onShare(asset);
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
      </td>
    </tr>
  );
}
