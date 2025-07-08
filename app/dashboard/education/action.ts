"use server";

import { revalidatePath } from "next/cache";
import * as yup from "yup";

import { prisma } from "@/lib/prisma";
import { deleteImage, extractPublicId, isCloudinaryUrl, uploadImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/;

const createEducationSchema = yup.object({
  school: yup.string().trim().required("School name is required."),
  degree: yup.string().trim().required("Degree is required."),
  startDate: yup.string().trim().required("Start date is required."),
  endDate: yup.string().trim().required("End date is required."),
  link: yup.string().trim().url("Invalid URL format").required("Link is required."),
  logoUrl: yup
    .string()
    .trim()
    .test("is-url-or-base64", "Invalid logo URL or Base64 format", (value) => {
      if (!value) return false; // required validation
      const isUrl = yup.string().url().isValidSync(value);
      const isBase64 = base64Regex.test(value);
      return isUrl || isBase64;
    })
    .required("Logo URL is required."),
});

export async function listEducationAction({ pageNo, pageSize }: { pageNo: number; pageSize: number }) {
  const skip = (pageNo - 1) * pageSize;
  const [education, totalCount] = await Promise.all([
    prisma.education.findMany({
      orderBy: { sequenceValue: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.education.count(),
  ]);

  return { education, totalCount };
}

const updateEducationSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Education ID is required."),
  school: yup.string().trim().required("School name is required."),
  degree: yup.string().trim().required("Degree is required."),
  startDate: yup.string().trim().required("Start date is required."),
  endDate: yup.string().trim().required("End date is required."),
  link: yup.string().trim().url("Invalid URL format").required("Link is required."),
  logoUrl: yup
    .string()
    .trim()
    .test("is-url-or-base64", "Invalid logo URL or Base64 format", (value) => {
      if (!value) return false; // required validation
      const isUrl = yup.string().url().isValidSync(value);
      const isBase64 = base64Regex.test(value);
      return isUrl || isBase64;
    })
    .required("Logo URL is required."),
  visibility: yup.boolean().optional(),
});

const toggleVisibilitySchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Education ID is required."),
});

const deleteEducationSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Education ID is required."),
});

const updateSequenceSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Education ID is required."),
  from: yup.number().integer().min(0, "Sequence value must be non-negative.").required(),
  to: yup.number().integer().min(0, "Sequence value must be non-negative.").required(),
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

export async function createEducationAction(data: {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  link: string;
  logoUrl: string;
}): Promise<ResponseType> {
  const validation = await validateSchema(createEducationSchema, data);
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated." };
  }

  try {
    console.log("Creating education...");
    const nextSequenceIndex = (await prisma.education.count()) + 1;

    const { secure_url } = await uploadImage(data.logoUrl);

    await prisma.education.create({
      data: {
        school: data.school.toLowerCase(),
        degree: data.degree.toLowerCase(),
        startDate: data.startDate,
        endDate: data.endDate,
        link: data.link,
        logoUrl: secure_url,
        sequenceValue: nextSequenceIndex,
        user: { connect: { id: session.user.id } },
      },
    });

    revalidatePath("/dashboard/education");
    return { success: true, message: "Education created successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while creating education.";
    return { success: false, message: errorMessage };
  }
}

// Update Education
export async function updateEducationAction(data: {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  link: string;
  logoUrl: string;
  visibility?: boolean;
}): Promise<ResponseType> {
  const validation = await validateSchema(updateEducationSchema, data);
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated." };
  }

  let imageUrl = null;
  if (!(await isCloudinaryUrl(data.logoUrl))) {
    const public_id = await prisma.education
      .findUnique({ where: { id: data.id }, select: { logoUrl: true } })
      .then((education) => (education?.logoUrl ? extractPublicId(education.logoUrl) : ""));
    const { secure_url } = await uploadImage(data.logoUrl);
    imageUrl = secure_url;
    await deleteImage(public_id);
  }

  try {
    await prisma.education.update({
      where: { id: data.id },
      data: {
        school: data.school.toLowerCase(),
        degree: data.degree.toLowerCase(),
        startDate: data.startDate,
        endDate: data.endDate,
        link: data.link,
        logoUrl: imageUrl ?? data.logoUrl,
        visibility: data.visibility,
      },
    });

    revalidatePath("/dashboard/education");
    return { success: true, message: "Education updated successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while updating education.";
    return { success: false, message: errorMessage };
  }
}

// Toggle Visibility
export async function toggleEducationVisibilityAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(toggleVisibilitySchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated." };
  }

  try {
    const education = await prisma.education.findUnique({ where: { id }, select: { visibility: true } });
    if (!education) {
      return { success: false, message: `Education with id ${id} not found.` };
    }

    await prisma.education.update({
      where: { id },
      data: { visibility: !education.visibility },
    });

    revalidatePath("/dashboard/education");
    return { success: true, message: "Visibility toggled successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while toggling visibility.";
    return { success: false, message: errorMessage };
  }
}

export async function deleteEducationAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(deleteEducationSchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated." };
  }
  const education = await prisma.education.findUnique({ where: { id } });
  if (!education) {
    return { success: false, message: `Education with id ${id} not found.` };
  }
  try {
    await prisma.$transaction(async (prisma) => {
      const education = await prisma.education.delete({ where: { id } });
      const public_id = await extractPublicId(education.logoUrl);
      await deleteImage(public_id);

      await prisma.education.updateMany({
        where: { userId: session.user.id, sequenceValue: { gt: education.sequenceValue } },
        data: { sequenceValue: { decrement: 1 } },
      });

      revalidatePath("/dashboard/education");
    });

    return { success: true, message: "Education deleted successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? "An error occurred while deleting education.";
    return { success: false, message: errorMessage };
  }
}

// Update Sequence of Education
export async function updateEducationSequenceAction({
  id,
  from,
  to,
}: {
  id: string;
  from: number;
  to: number;
}): Promise<ResponseType> {
  const validation = await validateSchema(updateSequenceSchema, { id, from, to });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated." };
  }

  try {
    await prisma.$transaction(async () => {
      if (from < to) {
        await prisma.education.updateMany({
          where: { sequenceValue: { gt: from, lte: to } },
          data: { sequenceValue: { decrement: 1 } },
        });
      } else {
        await prisma.education.updateMany({
          where: { sequenceValue: { gte: to, lt: from } },
          data: { sequenceValue: { increment: 1 } },
        });
      }

      await prisma.education.update({
        where: { id },
        data: { sequenceValue: to },
      });
    });

    revalidatePath("/dashboard/education");
    return { success: true, message: "Education sequence updated successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while updating sequence.";
    return { success: false, message: errorMessage };
  }
}
