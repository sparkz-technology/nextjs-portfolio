"use server";

import { revalidatePath } from "next/cache";
import * as yup from "yup";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createSkillSchema = yup.object({
  name: yup.string().trim().required("Skill name is required."),
});

const toggleVisibilitySchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Skill ID is required."),
});

const updateSkillSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Skill ID is required."),
  name: yup.string().trim().required("Skill name is required."),
  visibility: yup.boolean().optional(),
});

const deleteSkillSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Skill ID is required."),
});

const updateSequenceSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Skill ID is required."),
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

export async function listSkillsAction({ pageNo, pageSize }: { pageNo: number; pageSize: number }) {
  const skip = (pageNo - 1) * pageSize;
  const [skills, totalCount] = await Promise.all([
    prisma.skill.findMany({
      orderBy: { sequenceValue: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.skill.count(),
  ]);

  return { skills, totalCount };
}

export async function createSkillAction(name: string): Promise<ResponseType> {
  const validation = await validateSchema(createSkillSchema, { name });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const existingSkill = await prisma.skill.findFirst({
    where: { name: name.toLowerCase() },
  });

  if (existingSkill) {
    return { success: false, message: "Skill already exists." };
  }

  const nextOverIndex = (await prisma.skill.count()) + 1;

  await prisma.skill.create({
    data: {
      name: name.toLowerCase(),
      sequenceValue: nextOverIndex,
      user: { connect: { id: session.user.id } },
    },
  });

  try {
    revalidatePath("dashboard/skills");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Skill created skill.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Skill created successfully." };
}

export async function toggleVisibilityByIdAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(toggleVisibilitySchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const skill = await prisma.skill.findUnique({
    where: { id },
    select: { visibility: true },
  });

  if (!skill) {
    return { success: false, message: `Skill with id ${id} not found.` };
  }

  try {
    await prisma.skill.update({
      where: { id },
      data: { visibility: !skill.visibility },
    });
    revalidatePath("dashboard/skills");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Skill with id ${id} not found.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Visibility toggled successfully." };
}

export async function updateSkillAction(data: {
  id: string;
  name: string;
  visibility?: boolean;
}): Promise<ResponseType> {
  const validation = await validateSchema(updateSkillSchema, data);
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const existingSkill = await prisma.skill.findFirst({
    where: { name: data.name.toLowerCase(), id: { not: data.id } },
  });

  if (existingSkill) {
    return { success: false, message: "Skill already exists." };
  }

  try {
    await prisma.skill.update({
      where: { id: data.id },
      data: {
        name: data.name.toLowerCase(),
        visibility: data.visibility,
      },
    });

    revalidatePath("dashboard/skills");
    return { success: true, message: "Skill updated successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Skill with id ${data.id} not found.`;
    return { success: false, message: errorMessage };
  }
}

export async function deleteSkillAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(deleteSkillSchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated" };
  }

  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) {
    return { success: false, message: `Skill with id ${id} not found.` };
  }

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.skill.delete({ where: { id } });

      await prisma.skill.updateMany({
        where: { userId: session.user.id, sequenceValue: { gt: skill.sequenceValue } },
        data: { sequenceValue: { decrement: 1 } },
      });

      revalidatePath("dashboard/skills");
    });

    return { success: true, message: "Skill deleted successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Error deleting skill with id ${id}.`;
    return { success: false, message: errorMessage };
  }
}


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
        await prisma.skill.updateMany({
          where: { sequenceValue: { gt: from, lte: to } },
          data: { sequenceValue: { decrement: 1 } },
        });
      } else {
        await prisma.skill.updateMany({
          where: { sequenceValue: { gte: to, lt: from } },
          data: { sequenceValue: { increment: 1 } },
        });
      }

      await prisma.skill.update({
        where: { id },
        data: { sequenceValue: to },
      });
    });
    revalidatePath("dashboard/skills");
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Skill with id ${id} not found.`;
    return { success: false, message: errorMessage };
  }

  return { success: true, message: "Skill sequence updated successfully." };
}
