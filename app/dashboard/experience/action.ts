"use server";

import * as yup from "yup";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { deleteImage, extractPublicId, isCloudinaryUrl, uploadImage } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/;

const createWorkExperienceSchema = yup.object({
  company: yup.string().trim().required("Company name is required."),
  title: yup.string().trim().required("Job title is required."),
  startDate: yup.string().trim().required("Start date is required."),
  endDate: yup.string().trim().required("End date is required."),
  description: yup.string().trim().required("Description is required."),
  link: yup.string().trim().url("Invalid URL format").required("Link is required."),
  location: yup.string().trim().required("Location is required."),
  logoUrl: yup
    .string()
    .trim()
    .test("is-url-or-base64", "Invalid logo URL or Base64 format", (value) => {
      if (!value) return false; // required validation
      const isUrl = yup.string().url().isValidSync(value);
      const isBase64 = base64Regex.test(value);
      return isUrl || isBase64;
    })
    .required("Logo URL is required"),
});

const toggleVisibilitySchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Work Experience ID is required."),
});

const updateWorkExperienceSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Work Experience ID is required."),
  company: yup.string().trim().required("Company name is required."),
  title: yup.string().trim().required("Job title is required."),
  startDate: yup.string().trim().required("Start date is required."),
  endDate: yup.string().trim().required("End date is required."),
  description: yup.string().trim().required("Description is required."),
  link: yup.string().trim().url("Invalid URL format").required("Link is required."),
  location: yup.string().trim().required("Location is required."),
  logoUrl: yup
    .string()
    .trim()
    .test("is-url-or-base64", "Invalid logo URL or Base64 format", (value) => {
      if (!value) return false; // required validation
      const isUrl = yup.string().url().isValidSync(value);
      const isBase64 = base64Regex.test(value);
      return isUrl || isBase64;
    })
    .required("Logo URL is required"),
  visibility: yup.boolean().optional(),
});

const deleteWorkExperienceSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Work Experience ID is required."),
});

const updateSequenceSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Work Experience ID is required."),
  from: yup.number().integer().min(0, "Sequence value must be non-negative.").required(),
  to: yup.number().integer().min(0, "Sequence value must be non-negative.").required(),
});

// Validation helper function
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

// Retrieve authenticated session
async function retrieveAuthenticatedSession() {
  const session = await auth()
  return session;
}

export async function listWorkExprienceAction({ pageNo, pageSize }: { pageNo: number; pageSize: number }) {
  const skip = (pageNo - 1) * pageSize;
  const [workExperience, totalCount] = await Promise.all([
    prisma.workExperience.findMany({
      orderBy: { sequenceValue: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.workExperience.count(),
  ]);

  return { workExperience, totalCount };
}

interface ResponseType {
  success: boolean;
  message: string;
}

// Create Work Experience
export async function createWorkExperienceAction(data: {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  link: string;
  location: string;
  logoUrl: string;
}): Promise<ResponseType> {
  const validation = await validateSchema(createWorkExperienceSchema, data);
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const existingWorkExperience = await prisma.workExperience.findFirst({
    where: { company: data.company.toLowerCase() },
  });

  if (existingWorkExperience) {
    return { success: false, message: "Work Experience already exists." };
  }

  try {
    const nextOverIndex = (await prisma.workExperience.count()) + 1;
    const { secure_url } = await uploadImage(data.logoUrl);

    await prisma.workExperience.create({
      data: {
        company: data.company.toLowerCase(),
        title: data.title.toLowerCase(),
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        link: data.link,
        location: data.location,
        logoUrl: secure_url,
        sequenceValue: nextOverIndex,
        user: { connect: { id: session.user.id } },
      },
    });
    revalidatePath("dashboard/experience");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Work Experience created.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Work Experience created successfully." };
}

// Toggle visibility of Work Experience
export async function toggleVisibilityByIdAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(toggleVisibilitySchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const workExperience = await prisma.workExperience.findUnique({
    where: { id },
    select: { visibility: true },
  });

  if (!workExperience) {
    return { success: false, message: `Work Experience with id ${id} not found.` };
  }

  try {
    await prisma.workExperience.update({
      where: { id },
      data: { visibility: !workExperience.visibility },
    });
    revalidatePath("dashboard/experience");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Work Experience with id ${id} not found.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Visibility toggled successfully." };
}

// Update Work Experience
export async function updateWorkExperienceAction(data: {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  link: string;
  location: string;
  logoUrl: string;
  visibility?: boolean;
}): Promise<ResponseType> {
  const validation = await validateSchema(updateWorkExperienceSchema, data);
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const existingWorkExperience = await prisma.workExperience.findFirst({
    where: { company: data.company.toLowerCase(), id: { not: data.id } },
  });

  if (existingWorkExperience) {
    return { success: false, message: "Work Experience already exists." };
  }

  try {
    let imageUrl = null;
    const isValidCloudinaryUrl = await isCloudinaryUrl(data.logoUrl);
    if (!isValidCloudinaryUrl) {
      const public_id = await prisma.workExperience
        .findUnique({ where: { id: data.id }, select: { logoUrl: true } })
        .then((workExperience: { logoUrl: string } | null) => (workExperience?.logoUrl ? extractPublicId(workExperience.logoUrl) : ""));
      const { secure_url } = await uploadImage(data.logoUrl);
      imageUrl = secure_url;
      await deleteImage(public_id);
    }

    await prisma.workExperience.update({
      where: { id: data.id },
      data: {
        company: data.company.toLowerCase(),
        title: data.title.toLowerCase(),
        endDate: data.endDate,
        startDate: data.startDate,
        description: data.description,
        link: data.link,
        location: data.location,
        logoUrl: imageUrl ?? data.logoUrl,
        visibility: data.visibility,
      },
    });

    revalidatePath("dashboard/experience");
    return { success: true, message: "Work Experience updated successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Work Experience with id ${data.id} not found.`;
    return { success: false, message: errorMessage };
  }
}

export async function deleteWorkExperienceAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(deleteWorkExperienceSchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const workExperience = await prisma.workExperience.findUnique({ where: { id } });
  if (!workExperience) {
    return { success: false, message: `Work Experience with id ${id} not found.` };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (prisma: any) => {
      const workExperience = await prisma.workExperience.delete({ where: { id } });
      const public_id = await extractPublicId(workExperience.logoUrl);
      await deleteImage(public_id);

      await prisma.workExperience.updateMany({
        where: { userId: session.user.id, sequenceValue: { gt: workExperience.sequenceValue } },
        data: { sequenceValue: { decrement: 1 } },
      });

      revalidatePath("dashboard/experience");
    });

    // Return success message after the transaction completes
    return { success: true, message: "Work Experience deleted successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Error deleting work experience with id ${id}.`;
    return { success: false, message: errorMessage };
  }
}

// Update Sequence of Work Experience
export async function updateSequenceAction({
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

  if (from === to) {
    return { success: false, message: "No changes in sequence position." };
  }

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  try {
    await prisma.$transaction(async () => {
      if (from < to) {
        await prisma.workExperience.updateMany({
          where: { sequenceValue: { gt: from, lte: to } },
          data: { sequenceValue: { decrement: 1 } },
        });
      } else {
        await prisma.workExperience.updateMany({
          where: { sequenceValue: { gte: to, lt: from } },
          data: { sequenceValue: { increment: 1 } },
        });
      }

      await prisma.workExperience.update({
        where: { id },
        data: { sequenceValue: to },
      });
    });
    revalidatePath("dashboard/experience");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Work Experience with id ${id} not found.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Work Experience sequence updated successfully." };
}
