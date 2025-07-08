"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must not exceed 50 characters.")
    .required("Name is required"),
  initials: Yup.string()
    .matches(/^[A-Z]{2}$/, "Initials must be two uppercase letters.")
    .required("Initials are required"),
  url: Yup.string().url("Please enter a valid URL.").required("Website URL is required"),
  location: Yup.string()
    .min(2, "Location must be at least 2 characters.")
    .max(100, "Location must not exceed 100 characters.")
    .required("Location is required"),
  locationLink: Yup.string().url("Please enter a valid location URL.").required("Location link is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description must not exceed 1000 characters.")
    .required("Description is required"),
  summary: Yup.string()
    .min(50, "Summary must be at least 50 characters.")
    .max(500, "Summary must not exceed 500 characters.")
    .required("Summary is required"),
  avatarUrl: Yup.string().url("Please enter a valid avatar URL.").required("Avatar URL is required"),
  email: Yup.string().email("Please enter a valid email address.").required("Email is required"),
  tel: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number.")
    .required("Phone number is required"),
  socialLinks: Yup.array().of(
    Yup.object()
      .shape({
        name: Yup.string().required("Name is required"),
        href: Yup.string().url("Invalid URL").required("URL is required"),
        icon: Yup.object()
          .shape({
            id: Yup.string().required("Icon is required"),
          })
          .required("Icon is required"),
      })
      .required("Social link is required")
  ),
});
type AdminDataType = {
  name: string;
  initials: string;
  url: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  email: string;
  tel: string;
  socialLinks: {
    id: string;
    name: string;
    href: string;
    icon: {
      id: string;
    };
  }[];
};
async function validateSchema(schema: Yup.AnySchema, data: unknown) {
  try {
    await schema.validate(data, { abortEarly: false });
    return { success: true, message: "", status: 200 };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return { success: false, message: error.errors.join(", ") || "Invalid input data.", status: 400 };
    }
    return { success: false, message: "Invalid input data.", status: 400 };
  }
}

async function retrieveAuthenticatedSession() {
  const session = await auth();
  return session;
}

export async function listaboutAction() {
  try {
    const session = await retrieveAuthenticatedSession();
    if (!session?.user.id) {
      return { success: false, message: "User is not authenticated." };
    }
    const about = await prisma.user.findFirst({
      where: { id: session.user.id },
      include: {
        Contact: {
          include: {
            social: {
              include: {
                icon: true,
              },
            },
          },
        },
      },
    });
    return { success: true, about };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while updating about.";
    return { success: false, message: errorMessage };
  }
}

export async function updateAboutAction(data: AdminDataType): Promise<{ success: boolean; message: string }> {
  const validation = await validateSchema(validationSchema, data);
  if (!validation.success) return validation;

  const session = await retrieveAuthenticatedSession();
  if (!session?.user.id) {
    return { success: false, message: "User is not authenticated." };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (prisma: any) => {
      // Update Contact details
      const contactExists = await prisma.contact.findFirst({
        where: { userId: session.user.id },
      });
      let contact;
      if (!contactExists) {
        contact = await prisma.contact.create({
          data: {
            email: data.email,
            tel: data.tel,
            userId: session.user.id!,
          },
        });
      } else {
        contact = await prisma.contact.update({
          where: { userId: session.user.id },
          data: {
            email: data.email,
            tel: data.tel,
          },
        });
      }

      // Delete existing social links
      console.log("Deleting existing social links...");
      await prisma.socialLink.deleteMany({
        where: {
          contactId: contact.id, // Assuming this is available
        },
      });

      // Create new social links
      console.log("Creating new social links...");
      await prisma.socialLink.createMany({
        data: data.socialLinks.map((link) => ({
          iconId: link.icon.id, // Assuming `icon.id` is valid
          contactId: contact.id, // Associate with the correct Contact
          name: link.name, // Assuming `name` is the same as `type`
          url: link.href, // Assuming `url` is the same as `href`
          navbar: true, // Assuming `navbar` is a boolean value
        })),
      });

      // Update User details
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: data.name,
          initials: data.initials,
          url: data.url,
          location: data.location,
          locationLink: data.locationLink,
          description: data.description,
          summary: data.summary,
          avatarUrl: data.avatarUrl,
        },
      });
    });

    revalidatePath("/dashboard/about");
    return { success: true, message: "About updated successfully." };
  } catch (error) {
    const errorMessage = (error as Error)?.message || "An error occurred while updating about.";
    return { success: false, message: errorMessage };
  }
}
