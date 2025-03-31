"use server";

import { auth } from "@/lib/auth";
import { deleteImage, deleteVideo, extractPublicId, isCloudinaryUrl, uploadImage, uploadVideo } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { IProject } from "@/lib/types";
import { revalidatePath } from "next/cache";

import * as yup from "yup";

const iconSchema = yup.object({
  name: yup.string().required("Icon name is required."),
  icon: yup.string().required("Icon value is required."),
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

export const addIconAction = async (data: { value: string; label: string }) => {
  try {
    const session = await retrieveAuthenticatedSession();
    if (!session) {
      return { success: false, message: "User is not authenticated." };
    }
    const payload = {
      icon: data.value,
      name: data.label,
    };
    const validationResponse = await validateSchema(iconSchema, payload);
    if (!validationResponse.success) {
      return validationResponse;
    }
    await prisma.icon.create({
      data: {
        name: payload.name,
        value: payload.icon,
      },
    });
    revalidatePath("dashboard/project");
    return { success: true, message: "Icon created successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Failed to create icon.`;
    return { success: false, message: errorMessage };
  }
};

export const listIconsAction = async () => {
  try {
    const session = await retrieveAuthenticatedSession();
    if (!session) {
      return { success: false, message: "User is not authenticated." };
    }
    const icons = await prisma.icon.findMany();
    return icons;
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Failed to list icons.`;
    return { success: false, message: errorMessage };
  }
};

export const deleteIconAction = async (id: string) => {
  try {
    const session = await retrieveAuthenticatedSession();
    if (!session) {
      return { success: false, message: "User is not authenticated." };
    }
    if (!id) {
      return { success: false, message: "Icon ID is required." };
    }
    await prisma.icon.delete({ where: { id } });
    revalidatePath("dashboard/project");

    return { success: true, message: "Icon deleted successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Failed to delete icon.`;
    return { success: false, message: errorMessage };
  }
};

export const listProjectsAction = async ({ pageNo, pageSize }: { pageNo: number; pageSize: number }) => {
  // Retrieve authenticated session
  const session = await retrieveAuthenticatedSession();
  if (!session) {
    return { success: false, message: "User is not authenticated." };
  }
  // Fetch projects and total count
  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      orderBy: { sequenceValue: "asc" },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        description: true,
        technologies: true,
        sequenceValue: true,
        href: true,
        active: true,
        video: true,
        image: true,
        visibility: true,
        projectLinks: {
          select: {
            id: true,
            type: true,
            href: true,
            icon: {
              select: {
                id: true,
                name: true,
                value: true,
              },
            },
          },
        },
      },
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.count(),
  ]);

  // Map the projects to include related icons and any other transformations if needed
  const project: IProject[] = projects.map((project) => ({
    ...project,
    projectLinks: project.projectLinks.map((link) => ({
      ...link,
      icon: link.icon
        ? {
            id: link.icon.id,
            name: link.icon.name,
            value: link.icon.value,
          }
        : null, // Make sure we check if the icon exists
    })),
  }));

  return { project, totalCount };
};

interface ProjectLinkInput {
  type: string;
  href: string;
  icon: {
    id: string;
  };
}

interface ProjectInput {
  id?: string;
  title: string;
  href: string;
  startDate: string;
  endDate: string;
  visibility?: boolean;
  active: boolean;
  description: string;
  sequenceValue?: number;
  technologies: string[];
  projectLinks: ProjectLinkInput[];
  image: string;
  video: string;
}

// Define the project schema
const projectSchema = yup.object({
  title: yup.string().required("Title is required."),
  href: yup.string().url("Must be a valid URL.").required("Href is required."),
  startDate: yup.string().trim().required("Start date is required."),
  endDate: yup.string().trim().required("End date is required."),
  active: yup.boolean().required("Active status is required."),
  description: yup.string().required("Description is required."),
  technologies: yup
    .array()
    .of(yup.string().required("Each technology must be a string."))
    .required("Technologies are required."),
  projectLinks: yup
    .array()
    .of(
      yup.object({
        type: yup.string().required("Type is required."),
        href: yup.string().url("Must be a valid URL.").required("Href is required."),
        icon: yup.object({
          id: yup.string().required("Icon ID is required."),
        }),
      })
    )
    .required("Project links are required."),
  image: yup.string().required("Image is required."),
  video: yup.string().required("Video is required."),
});

export async function createProjectAction(data: ProjectInput) {
  const session = await retrieveAuthenticatedSession();
  if (!session) {
    return { success: false, message: "User is not authenticated." };
  }
  const validation = await validateSchema(projectSchema, data);
  if (!validation.success) {
    return { success: false, message: validation.message, status: validation.status };
  }

  try {
    const { secure_url: imageUrl } = await uploadImage(data.image);
    const { secure_url: videoUrl } = await uploadVideo(data.video);

    const nextSequenceIndex = (await prisma.project.count()) + 1 || 0;
    const project = await prisma.project
      .create({
        data: {
          title: data?.title,
          href: data?.href,
          startDate: data.startDate,
          endDate: data.endDate,
          active: data.active,
          description: data.description,
          sequenceValue: nextSequenceIndex,
          technologies: data.technologies,
          image: imageUrl,
          video: videoUrl,
          userId: session.user.id ?? "",
          projectLinks: {
            create: data.projectLinks.map((link) => ({
              type: link.type,
              href: link.href,
              icon: {
                connect: { id: link.icon.id },
              },
            })),
          },
        },
      })
      .catch(() => {
        return { success: false, message: "Failed to create project.", status: 500 };
      });
    revalidatePath("dashboard/project");
    return { success: true, data: project, status: 201 };
  } catch {
    return { success: false, message: "Failed to create project.", status: 500 };
  }
}

// Update a project
export async function updateProjectAction(data: ProjectInput) {
  const session = await retrieveAuthenticatedSession();
  if (!session) {
    return { success: false, message: "User is not authenticated." };
  }
  const validation = await validateSchema(projectSchema, data);
  if (!validation.success) {
    return { success: false, message: validation.message, status: validation.status };
  }
  let imageUrl = null;
  if (!(await isCloudinaryUrl(data.image))) {
    const public_id = await prisma.project
      .findUnique({ where: { id: data.id }, select: { image: true } })
      .then((project) => (project?.image ? extractPublicId(project.image) : ""));
    const { secure_url } = await uploadImage(data.image);
    imageUrl = secure_url;
    await deleteImage(public_id);
  }

  let videoUrl = null;
  if (!(await isCloudinaryUrl(data.video))) {
    const public_id = await prisma.project
      .findUnique({ where: { id: data.id }, select: { video: true } })
      .then((project) => (project?.video ? extractPublicId(project.video) : ""));
    const { secure_url } = await uploadVideo(data.image);
    videoUrl = secure_url;
    await deleteVideo(public_id);
  }

  try {
    const project = await prisma.project.update({
      where: { id: data.id },
      data: {
        title: data.title,
        href: data.href,
        startDate: data.startDate,
        endDate: data.endDate,
        active: data.active,
        description: data.description,
        sequenceValue: data.sequenceValue,
        technologies: data.technologies,
        image: imageUrl ?? data.image,
        video: videoUrl ?? data.video,
        userId: session.user.id ?? "",
        projectLinks: {
          deleteMany: {}, // Deletes all existing project links
          create: data.projectLinks.map((link) => ({
            type: link.type,
            href: link.href,
            icon: {
              connect: { id: link.icon.id },
            },
          })),
        },
      },
    });
    revalidatePath("dashboard/project");
    return { success: true, data: project, status: 200 };
  } catch{
    return { success: false, message: "Failed to update project.", status: 500 };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    if (!projectId) {
      throw new TypeError("The projectId argument is required.");
    }
    const projectToDelete = await prisma.project.findUnique({
      where: { id: projectId },
      select: { sequenceValue: true, userId: true, image: true, video: true },
    });

    if (!projectToDelete) {
      return { success: false, message: "Project not found.", status: 404 };
    }

    await prisma.$transaction(async (prisma) => {
      const project = await prisma.project.delete({
        where: { id: projectId },
      });

      if (!project) throw new Error("Failed to delete project.");

      const public_id_image = await extractPublicId(project.image);
      if (public_id_image) {
        await deleteImage(public_id_image);
      } else {
        throw new Error("Failed to delete project.");
      }

      const public_id_video = await extractPublicId(project.video);
      if (public_id_video) {
        await deleteVideo(public_id_video);
      } else {
        throw new Error("Failed to delete project.");
      }

      await prisma.project.updateMany({
        where: {
          userId: projectToDelete.userId,
          sequenceValue: {
            gt: projectToDelete.sequenceValue,
          },
        },
        data: {
          sequenceValue: { decrement: 1 },
        },
      });
    });

    revalidatePath("dashboard/project");

    return {
      success: true,
      message: "Project deleted successfully and sequence updated.",
      status: 200,
    };
  } catch{
    return { success: false, message: "Failed to delete project.", status: 500 };
  }
}

const updateSequenceSchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Project ID is required."),
  from: yup.number().integer().min(0, "Sequence value must be non-negative.").required(),
  to: yup.number().integer().min(0, "Sequence value must be non-negative.").required(),
});

interface ResponseType {
  success: boolean;
  message: string;
}

export async function updateProjectSequenceAction({
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
        await prisma.project.updateMany({
          where: { sequenceValue: { gt: from, lte: to } },
          data: { sequenceValue: { decrement: 1 } },
        });
      } else {
        await prisma.project.updateMany({
          where: { sequenceValue: { gte: to, lt: from } },
          data: { sequenceValue: { increment: 1 } },
        });
      }

      await prisma.project.update({
        where: { id },
        data: { sequenceValue: to },
      });
    });

    revalidatePath("dashboard/project");
    return { success: true, message: "Project sequence updated successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while updating sequence.";
    return { success: false, message: errorMessage };
  }
}

const toggleVisibilitySchema = yup.object({
  id: yup.string().uuid("Invalid UUID format").required("Project ID is required."),
});

// Toggle Visibility
export async function toggleProjectVisibilityAction(id: string): Promise<ResponseType> {
  const validation = await validateSchema(toggleVisibilitySchema, { id });
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated." };
  }

  try {
    const education = await prisma.project.findUnique({ where: { id }, select: { visibility: true } });
    if (!education) {
      return { success: false, message: `Project with id ${id} not found.` };
    }

    await prisma.project.update({
      where: { id },
      data: { visibility: !education.visibility },
    });

    revalidatePath("dashboard/project");
    return { success: true, message: "Visibility toggled successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while toggling visibility.";
    return { success: false, message: errorMessage };
  }
}
