"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as yup from "yup";

const uuidSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Guest signature ID is required."),
});

async function validateSchema(schema: yup.AnySchema, data: unknown) {
  try {
    await schema.validate(data, { abortEarly: false });
    return { success: true, message: "", status: 200 };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { success: false, message: error.errors.join(", ") || "Invalid input data.", status: 400 };
    }
    return { success: false, message: "Invalid input data.", status: 400 };
  }
}

async function retrieveAuthenticatedSession() {
  const session = await auth();
  return session;
}

interface ResponseType {
  success: boolean;
  message: string;
}

export async function listGuestSignatureAction({ pageNo, pageSize }: { pageNo: number; pageSize: number }) {
  const skip = (pageNo - 1) * pageSize;
  const [guestSignature, totalCount] = await Promise.all([
    prisma.guestSignature.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        message: true,
        signatureUrl: true,
        createdAt: true,
        updatedAt: true,
        visibility: true,
        userId: true,
        user: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },

      skip,
      take: pageSize,
    }),
    prisma.guestSignature.count(),
  ]);

  return { guestSignature, totalCount };
}
export async function toggleVisibilityByIdAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(uuidSchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const guestSignature = await prisma.guestSignature.findUnique({
    where: { id },
    select: { visibility: true },
  });

  if (!guestSignature) {
    return { success: false, message: `Guest signature with id ${id} not found.` };
  }

  try {
    await prisma.guestSignature.update({
      where: { id },
      data: { visibility: !guestSignature.visibility },
    });
    revalidatePath("dashboard/guestbook");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Guest signature with id ${id} not found.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Visibility toggled successfully." };
}

export async function deleteGuestSignatureAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(uuidSchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const skill = await prisma.guestSignature.findUnique({ where: { id } });
  if (!skill) {
    return { success: false, message: `Guest signature with id ${id} not found.` };
  }

  try {
    await prisma.guestSignature.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isDeleted: true,
      },
    });
    revalidatePath("dashboard/guestbook");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Failed to soft delete guest signature with id ${id}.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Guest signature soft-deleted successfully." };
}
