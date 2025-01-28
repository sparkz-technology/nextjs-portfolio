"use server";

import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function uploadAssetAction(formData: FormData) {
  try {
    const file = formData.get("file") as string;
    const fileName = formData.get("fileName") as string;
    const fileType = formData.get("fileType") as string;
    const { public_id, secure_url } = await uploadImage(file);
    await prisma.asset.create({
      data: {
        name: fileName,
        type: fileType.startsWith("image") ? "image" : "video",
        url: secure_url as string,
        publicId: public_id as string,
      },
    });
    revalidatePath("dashboard/assets");
    return { success: true, message: "Asset uploaded successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while updating about.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteAssetAction(id: string) {
  try {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return { success: false, message: "Asset not found." };
    }

    await deleteImage(asset.publicId);
    await prisma.asset.delete({ where: { id } });
    revalidatePath("dashboard/assets");
    return { success: true, message: "Asset deleted successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while deleting asset.";
    return { success: false, message: errorMessage };
  }
}

export async function listassetsAction({ pageNo, pageSize }: { pageNo: number; pageSize: number }) {
  const skip = (pageNo - 1) * pageSize;
  const [asset, totalCount] = await Promise.all([
    prisma.asset.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        publicId: true,
        createdAt: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.asset.count(),
  ]);

  return { asset, totalCount };
}
