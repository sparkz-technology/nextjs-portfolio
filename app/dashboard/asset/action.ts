"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { formatFileSize } from "@/lib/utils";
import type { AssetQueryParams, PaginatedResponse, AssetType, FolderType } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { deleteImage, uploadFile } from "@/lib/cloudinary";

export async function createFolder(name: string, parentId: string | null = null) {
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        parentId,
      },
    });

    revalidateTag("folders");
    return { success: true, folder };
  } catch (error) {
    console.error("Error creating folder:", error);
    return { success: false, error: "Failed to create folder" };
  }
}
export async function updateFolder(id: string, name: string) {
  try {
    const folder = await prisma.folder.update({
      where: { id },
      data: { name },
    });

    //  revalidatePath("dashboard/assets");
    revalidateTag("folders");
    return { success: true, folder };
  } catch (error) {
    console.error("Error updating folder:", error);
    return { success: false, error: "Failed to update folder" };
  }
}
export async function deleteFolder(id: string) {
  try {
    const subfolders = await prisma.folder.findMany({
      where: { parentId: id },
    });

    for (const subfolder of subfolders) {
      await deleteFolder(subfolder.id);
    }

    await prisma.asset.deleteMany({
      where: { folderId: id },
    });

    await prisma.folder.delete({
      where: { id },
    });

    revalidateTag("folders");
    return { success: true };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return { success: false, error: "Failed to delete folder" };
  }
}
// Fix the getFolders function to properly handle nested folders
export async function getFolders() {
  try {
    // First get all folders
    const allFolders = await prisma.folder.findMany({
      include: {
        children: true,
      },
    });

    // Then build the tree structure (only root folders)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootFolders = allFolders.filter((folder: any) => folder.parentId === null);

    // Function to recursively build the folder tree
    const buildFolderTree = (folder: { id: string }): FolderType => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children = allFolders.filter((f: any) => f.parentId === folder.id);
      return {
        ...folder,
        children: children.map(buildFolderTree),
      } as FolderType;
    };

    // Map root folders to include their full tree
    const folders = rootFolders.map(buildFolderTree) as FolderType[];

    return { success: true, folders };
  } catch (error) {
    console.error("Error fetching folders:", error);
    return { success: false, error: "Failed to fetch folders" };
  }
}
// Asset actions
export async function createAsset(data: {
  name: string;
  type: string;
  size: number;
  url: string;
  folderId: string | null;
}) {
  try {
    const { public_id, secure_url } = await uploadFile(data.url);

    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        type: data.type,
        size: data.size,
        url: secure_url,
        publicId: public_id,
        folderId: data.folderId,
      },
    });

     revalidatePath("dashboard/assets");
    return { success: true, asset };
  } catch (error) {
    console.error("Error creating asset:", error);
    return { success: false, error: "Failed to create asset" };
  }
}

export async function updateAsset(
  id: string,
  data: {
    name?: string;
    folderId?: string | null;
    favorite?: boolean;
  }
) {
  try {
    const asset = await prisma.asset.update({
      where: { id },
      data,
    });

     revalidatePath("dashboard/assets");
    return { success: true, asset };
  } catch (error) {
    console.error("Error updating asset:", error);
    return { success: false, error: "Failed to update asset" };
  }
}

export async function deleteAsset(id: string) {
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, message: "Asset not found." };
    }
    if (!asset.publicId) {
      return { success: false, message: "Asset does not have a public ID." };
    }
    await deleteImage(asset.publicId);
    await prisma.asset.delete({ where: { id } });
     revalidatePath("dashboard/assets");
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { success: false, error: "Failed to delete asset" };
  }
}

export async function getAssetsPaginated(
  params: AssetQueryParams
): Promise<{ success: boolean; assets?: AssetType[]; meta?: PaginatedResponse<AssetType>["meta"]; error?: string }> {
  try {
    const { folderId, page, limit, sortBy, sortDirection, filterBy, search } = params;
    const skip = (page - 1) * limit;
    // Build the where clause based on filters
    let where: Record<string, unknown> = folderId !== null ? { folderId } : {};

    // Apply search filter if provided
    if (search && search.trim() !== "") {
      where = {
        ...where,
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Apply type filter
    if (filterBy === "images") {
      where.type = "image";
    } else if (filterBy === "documents") {
      where.type = "document";
    } else if (filterBy === "favorites") {
      where.favorite = true;
    }else if (filterBy === "others") {
      where.type = {
        not: {
          in: ["image", "document"],
        },
      };
    }

    // Build the orderBy clause
    const orderBy: Record<string, string> = {};
    switch (sortBy) {
      case "name":
        orderBy.name = sortDirection;
        break;
      case "size":
        orderBy.size = sortDirection;
        break;
      case "date":
        orderBy.updatedAt = sortDirection;
        break;
      case "type":
        orderBy.type = sortDirection;
        break;
      default:
        orderBy.createdAt = "desc";
    }

    // Count total matching assets for pagination
    const totalAssets = await prisma.asset.count({ where });
    // Fetch the assets with pagination
    const assets = await prisma.asset.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Format the assets
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedAssets = assets.map((asset: any) => ({
      ...asset,
      size: asset.size ?? 0,
      publicId: asset.publicId ?? "",
      sizeFormatted: asset.size !== null ? formatFileSize(asset.size) : "0 B",
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalAssets / limit);
    const hasMore = page < totalPages;

    return {
      success: true,
      assets: formattedAssets,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: totalAssets,
        hasMore,
      },
    };
  } catch (error) {
    console.error("Error fetching assets:", error);
    return { success: false, error: "Failed to fetch assets" };
  }
}

export async function toggleFavorite(id: string) {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      select: { favorite: true },
    });

    if (!asset) {
      return { success: false, error: "Asset not found" };
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { favorite: !asset.favorite },
    });

     revalidatePath("dashboard/assets");
    return { success: true, asset: updatedAsset };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, error: "Failed to toggle favorite" };
  }
}

export async function moveAssets(assetIds: string[], folderId: string | null) {
  try {
    await prisma.asset.updateMany({
      where: { id: { in: assetIds } },
      data: { folderId },
    });

     revalidatePath("dashboard/assets");
    return { success: true };
  } catch (error) {
    console.error("Error moving assets:", error);
    return { success: false, error: "Failed to move assets" };
  }
}

export async function getAssets(
  folderId: string | null
): Promise<{ success: boolean; assets?: AssetType[]; error?: string }> {
  try {
    console.log("Fetching assets for folder:", folderId);
    const assets = await prisma.asset.findMany({
      ...(folderId ? { where: { folderId } } : {}),
      orderBy: { createdAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedAssets = assets.map((asset: any) => ({
      ...asset,
      size: asset.size ?? 0,
      publicId: asset.publicId ?? "",
      sizeFormatted: asset.size !== null ? formatFileSize(asset.size) : "0 B",
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    }));

    return { success: true, assets: formattedAssets };
  } catch (error) {
    console.error("Error fetching assets:", error);
    return { success: false, error: "Failed to fetch assets" };
  }
}

export async function searchAssets(
  search: string
): Promise<{ success: boolean; assets?: AssetType[]; error?: string }> {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedAssets = assets.map((asset: any) => ({
      ...asset,
      size: asset.size ?? 0,
      publicId: asset.publicId ?? "",
      sizeFormatted: asset.size !== null ? formatFileSize(asset.size) : "0 B",
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    }));

    return { success: true, assets: formattedAssets };
  } catch (error) {
    console.error("Error searching assets:", error);
    return { success: false, error: "Failed to search assets" };
  }
}
