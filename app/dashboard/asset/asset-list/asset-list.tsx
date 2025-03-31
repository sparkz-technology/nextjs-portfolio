"use client";

import { useEffect, useRef } from "react";
import { File } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { AssetGridItem } from "../asset-list/asset-grid-item";
import { AssetListItem } from "../asset-list/asset-list-item";
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore";
import { getAssetsPaginated } from "../action";
import type { AssetType } from "@/lib/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";

export function AssetList() {
  const {
    viewMode,
    assets,
    selectedAssets,
    currentFolder,
    sortBy,
    sortDirection,
    filterBy,
    searchQuery,
    page,
    hasMore,
    isLoadingMore,
    isLoadingAssets,
    setAssets,
    appendAssets,
    setSelectedAssets,
    toggleSelectedAsset,
    setHasMore,
    setLoadingMore,
    incrementPage,
    setLoadingAssets,
    openPreviewDialog,
    openRenameDialog,
    openDeleteDialog,
    openShareDialog,
    setDownloadingAsset,
    setDownloadingSelected,
  } = useAssetManagerStore();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingAssets(true);

      const result = await getAssetsPaginated({
        folderId: currentFolder,
        page: 1,
        limit: 20,
        sortBy,
        sortDirection,
        filterBy,
        search: searchQuery,
      });

      if (result.success && result.assets && result.meta) {
        setAssets(result.assets);
        setHasMore(result.meta.hasMore);
      }

      setLoadingAssets(false);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder, sortBy, sortDirection, filterBy, searchQuery]);
  const listVirtualizerRef = useRef(null);
  const gridVirtualizerRef = useRef(null);
  const listVirtualizer = useVirtualizer({
    enabled: viewMode === "list",
    count: assets.length,
    getScrollElement: () => listVirtualizerRef.current,
    estimateSize: () => 25,
  });
  const gridVirtualizer = useVirtualizer({
    enabled: viewMode === "grid",
    count: assets.length,
    getScrollElement: () => gridVirtualizerRef.current,
    estimateSize: () => 25,
    overscan: 5,
  });
  const onPreviewAsset = (asset: AssetType) => {
    openPreviewDialog(asset);
  };

  const onRenameAsset = (asset: { id: string; name: string }) => {
    openRenameDialog({ ...asset, type: "file" });
  };

  const onDeleteAsset = (asset: { id: string; name: string }) => {
    openDeleteDialog([{ ...asset, type: "file" }]);
  };

  const onShareAsset = (asset: AssetType) => {
    openShareDialog(asset);
  };

  const onDownloadAsset = async (asset: AssetType) => {
    setDownloadingAsset(asset.id, true);
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
    setDownloadingAsset(asset.id, false);
  };

  const loadMoreAssets = async () => {
    if (!hasMore || isLoadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const result = await getAssetsPaginated({
      folderId: currentFolder,
      page: nextPage,
      limit: 20,
      sortBy,
      sortDirection,
      filterBy,
      search: searchQuery,
    });

    if (result.success && result.assets && result.meta) {
      appendAssets(result.assets);
      setHasMore(result.meta.hasMore);
      incrementPage();
    }
    setLoadingMore(false);
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      const allAssetIds = assets.map((asset) => asset.id);
      setSelectedAssets(allAssetIds);
    }
  };

  if (isLoadingAssets && assets.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
      <InfiniteScroll
        loadMore={loadMoreAssets}
        hasMore={hasMore}
        isLoading={isLoadingMore}
        className="h-full overflow-y-auto p-2"
      >
        <div className="h-full overflow-y-auto p-2" ref={gridVirtualizerRef}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {gridVirtualizer.getVirtualItems().map((virtual) => (
              <AssetGridItem
                key={assets[virtual.index].id}
                asset={assets[virtual.index]}
                isSelected={selectedAssets.includes(assets[virtual.index].id)}
                onSelect={toggleSelectedAsset}
                onPreview={onPreviewAsset}
                onRename={onRenameAsset}
                onDelete={onDeleteAsset}
                onShare={onShareAsset}
                onDownload={onDownloadAsset}
              />
            ))}
          </div>
        </div>
      </InfiniteScroll>
    );
  }

  return (
    <InfiniteScroll
      loadMore={loadMoreAssets}
      hasMore={hasMore}
      isLoading={isLoadingMore}
      className="h-full overflow-y-auto p-2"
    >
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-xs" ref={listVirtualizerRef}>
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-1.5 px-2 text-left w-8">
                <Checkbox
                  checked={selectedAssets.length > 0 && selectedAssets.length === assets.length}
                  onCheckedChange={handleSelectAll}
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
            {listVirtualizer.getVirtualItems().map((virtual) => (
              <AssetListItem
                key={assets[virtual.index].id}
                asset={assets[virtual.index]}
                isSelected={selectedAssets.includes(assets[virtual.index].id)}
                onSelect={toggleSelectedAsset}
                onPreview={onPreviewAsset}
                onRename={onRenameAsset}
                onDelete={onDeleteAsset}
                onShare={onShareAsset}
                onDownload={onDownloadAsset}
              />
            ))}
          </tbody>
        </table>
      </div>
    </InfiniteScroll>
  );
}
