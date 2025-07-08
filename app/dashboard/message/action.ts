"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as yup from "yup";

const uuidSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Message ID is required."),
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

export async function toggleReadByIdAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(uuidSchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const message = await prisma.message.findUnique({
    where: { id },
    select: { id: true, isRead: true },
  });

  if (!message) {
    return { success: false, message: `Message with id ${id} not found.` };
  }

  try {
    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: !message.isRead },
    });

    revalidatePath("/dashboard/message");

    return {
      success: true,
      message: `Message ${updatedMessage.isRead ? "marked as read" : "marked as unread"}.`,
    };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "Failed to update the message visibility.";
    return { success: false, message: errorMessage };
  }
}

export async function listMessageAction({ pageNo, pageSize }: { pageNo: number; pageSize: number }) {
  const skip = (pageNo - 1) * pageSize;
  const [message, totalCount] = await Promise.all([
    prisma.message.findMany({
      where: {},
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        message: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        isRead: true,
        userId: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.message.count(),
  ]);

  return { message, totalCount };
}