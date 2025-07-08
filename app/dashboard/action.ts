"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns"; // Import the format function from date-fns

export type VisitLogFilterType = "3m" | "6m" | "1y";

const  dateFilterMap: Record<VisitLogFilterType, () => Date> = {
  "3m": () => new Date(new Date().setMonth(new Date().getMonth() - 3)),
  "6m": () => new Date(new Date().setMonth(new Date().getMonth() - 6)),
  "1y": () => new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
};

export async function listVisitLogAction(type: VisitLogFilterType) {
  const dateFilter = dateFilterMap[type]() ?? dateFilterMap["1y"]();

  // Fetch visit logs and aggregate desktop/mobile visits in one query
  const [visitLog, visitAggregate] = await Promise.all([
    prisma.visit.findMany({
      where: {
        date: {
          gte: dateFilter,
        },
      },
      select: {
        date: true, // Keep date field without format
        desktopVisits: true,
        mobileVisits: true,
      },
    }),
    prisma.visit.aggregate({
      where: {
        date: {
          gte: dateFilter,
        },
      },
      _sum: {
        desktopVisits: true,
        mobileVisits: true,
      },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedVisitLog = visitLog.map((log: any) => ({
    mobile: log.mobileVisits,
    desktop: log.desktopVisits,
    date: format(log.date, "yyyy-MM-dd"),
  }));

  return {
    visitLog: formattedVisitLog,
    totalDesktopVisits: visitAggregate._sum.desktopVisits || 0,
    totalMobileVisits: visitAggregate._sum.mobileVisits || 0,
  };
}

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

export const addIconAction = async (data: { value: string; label: string }, revalidateString: string) => {
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
    revalidatePath(revalidateString);
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

export const deleteIconAction = async (id: string, revalidateString: string) => {
  try {
    const session = await retrieveAuthenticatedSession();
    if (!session) {
      return { success: false, message: "User is not authenticated." };
    }
    if (!id) {
      return { success: false, message: "Icon ID is required." };
    }
    await prisma.icon.delete({ where: { id } });
    revalidatePath(revalidateString);

    return { success: true, message: "Icon deleted successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message ?? `Failed to delete icon.`;
    return { success: false, message: errorMessage };
  }
};
