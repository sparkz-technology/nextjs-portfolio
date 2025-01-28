import { notFound } from "next/navigation";

import { ISearchParams } from "@/lib/type";
import { AssetTable } from "@/app/dashboard/asset/asset-table";
import { listassetsAction } from "@/app/dashboard/asset/action";
import { AssetViewDialog, DeleteDialog, UploadAssetDialog } from "@/app/dashboard/asset/asset-dialog";

interface AssetPageProps {
  searchParams: Promise<ISearchParams>;
}

export default async function AssetPage({ searchParams }: AssetPageProps) {
  const { page, pageSize } = (await searchParams) || {};
  const currentPage = parseInt(page || "1", 10);
  const assetPageSize = parseInt(pageSize || "5", 10);
  const { asset, totalCount } = await listassetsAction({
    pageNo: currentPage,
    pageSize: assetPageSize,
  });

  if (!asset) {
    return notFound();
  }
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Asset Manager</h1>
        <AssetViewDialog />
        <UploadAssetDialog />
      </div>
      <DeleteDialog />
      <AssetTable data={asset} totalCount={totalCount} currentPage={currentPage} assetPageSize={assetPageSize} />
    </div>
  );
}
