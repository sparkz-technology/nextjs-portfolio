"use server";

import { AssetSidebar } from "./asset-manager/asset-sidebar";
import { AssetToolbar } from "./asset-manager/asset-toolbar";
import { AssetList } from "./asset-list/asset-list";
import { AssetStatusBar } from "./asset-manager/asset-status-bar";
import { AssetDialogs } from "./asset-manager/asset-dialogs";
import { getFolders } from "./action";
import { unstable_cache } from "next/cache";

export async function AssetManager() {
  const folderCatchFn = unstable_cache(
    async () => {
      return await getFolders();
    },
    ["folders"],
    {
      tags: ["folders"],
      revalidate: 60,
    }
  );

  const folders = await folderCatchFn();

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <AssetSidebar folders={folders.folders} />

        {/* Main content */}
        <div className="flex flex-col">
          {/* Toolbar */}
          <AssetToolbar />

          {/* Files */}
          <div className="h-[calc(100vh-17rem)] overflow-hidden">
            <AssetList />
          </div>

          {/* Status bar */}
          <AssetStatusBar />
        </div>
      </div>

      {/* Dialogs */}
      <AssetDialogs folders={folders.folders || []} />
    </div>
  );
}
