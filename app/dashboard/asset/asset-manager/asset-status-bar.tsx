"use client"

import { Button } from "@/components/ui/button"
import { useAssetManagerStore } from "@/lib/zustand/use-assetMangerstore"

export function AssetStatusBar() {
  const { assets, selectedAssets, totalAssets, clearSelectedAssets } = useAssetManagerStore()

  return (
    <div className="border-t p-1.5 flex items-center justify-between text-xs text-muted-foreground">
      <div>
        {selectedAssets.length > 0 ? (
          <span>{selectedAssets.length} selected</span>
        ) : (
          <span>
            {assets.length} files {totalAssets > assets.length ? `(${totalAssets} total)` : ""}
          </span>
        )}
      </div>
      <div>
        {selectedAssets.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearSelectedAssets}>
            Clear selection
          </Button>
        )}
      </div>
    </div>
  )
}

