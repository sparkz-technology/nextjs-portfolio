"use server";

import checkProfanity from "@/lib/action";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface GuestSignatureValues {
  message: string;
  signature: string;
}
interface ResponseType {
  success: boolean;
  message: string;
  status?: number;
}

const generateResponse = (success: boolean, message: string, status: number): ResponseType => ({
  success,
  message,
  status,
});

const createGuestSignature = async (values: GuestSignatureValues): Promise<ResponseType> => {
  const session = await auth();

  if (!session?.user?.id) {
    return generateResponse(false, "User is not authenticated", 401);
  }

  const profanityCheckResult = await checkProfanity(values.message);
  if (profanityCheckResult) {
    return generateResponse(false, "Profanity is not allowed", 400);
  }

  const existingSignature = await getUserSignature(session.user.id);
  if (existingSignature) {
    return handleExistingSignature(existingSignature);
  }

  const { secure_url } = await uploadSignatureImage(values.signature);

  try {
    await saveGuestSignature(values.message, secure_url, session.user.id);
    revalidatePath("/guestbook");

    return generateResponse(true, "Guest signature created successfully", 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create guest signature";
    return generateResponse(false, errorMessage, 500);
  }
};

const getUserSignature = async (userId: string) => {
  return prisma.guestSignature.findFirst({
    where: { userId },
  });
};

const handleExistingSignature = (signature: { isDeleted: boolean }): ResponseType => {
  if (signature.isDeleted) {
    return generateResponse(
      false,
      "User has already signed the guestbook but the signature is deleted. Please contact the administrator to restore the signature.",
      400
    );
  }
  return generateResponse(false, "User has already signed the guestbook", 400);
};

const uploadSignatureImage = async (signature: string): Promise<{ secure_url: string }> => {
  return uploadImage(signature);
};

const saveGuestSignature = async (message: string, signatureUrl: string, userId: string) => {
  await prisma.guestSignature.create({
    data: {
      message,
      signatureUrl,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

export { createGuestSignature };

interface ToggleLikeParams {
  guestSignatureId: string;
}

export async function toggleGuestSignatureLikeAction({ guestSignatureId }: ToggleLikeParams): Promise<ResponseType> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "User is not authenticated", status: 401 };
    }
    const existingLike = await prisma.guestSignatureLike.findUnique({
      where: {
        userId_guestSignatureId: {
          userId: session?.user?.id,
          guestSignatureId,
        },
      },
    });

    if (existingLike) {
      await prisma.guestSignatureLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      revalidatePath("/guestbook");
      return { message: "Like removed.", success: true, status: 200 };
    } else {
      await prisma.guestSignatureLike.create({
        data: {
          userId: session?.user?.id,
          guestSignatureId,
        },
      });
      revalidatePath("/guestbook");
      return { message: "Like added.", success: true, status: 200 };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { message: "Failed to toggle like.", success: false, status: 500 };
  }
}
