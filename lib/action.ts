"use server";

import { Filter } from "bad-words";
import * as yup from "yup";
import { transporter } from "./mail";
import { constant } from "@/configs/constant";
import { prisma } from "@/lib/prisma";
import { auth } from "./auth";


export default async function checkProfanity(message: string): Promise<boolean> {
  if (message) {
    const filter = new Filter();
    const isProfane = filter.isProfane(message);
    if (isProfane) {
      return false;
    }
  }
  return false;
}

const { EMAIL, EMAIL_TO } = constant;

const schema = yup.object({
  name: yup.string().required("Name is required."),
  email: yup
    .string()
    .email("Invalid email")
    .test("is-google-domain", "Email must be from a Google domain", (value) => {
      if (!value) return false;
      const domain = value.split("@")[1];
      const googleDomains = ["gmail.com", "google.com", "googlemail.com"];
      return googleDomains.includes(domain);
    })
    .required("Email is required"),
  message: yup.string().required("Message is required."),
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
interface ResponseType {
  success: boolean;
  message: string;
}

type SendEmailNotification = { name: string; email: string; message: string };

export async function sendEmailNotification({ name, email, message }: SendEmailNotification): Promise<ResponseType> {
  const validationResponse = await validateSchema(schema, { name, email, message });

  if (!validationResponse.success) {
    return validationResponse;
  }
  try {
    const session = await auth();
    await transporter.sendMail({
      from: EMAIL,
      to: EMAIL_TO,
      subject: `Hello ${name}`,
      text: `You have a new message from ${email}: ${message}`,
    });

    await prisma.message.create({
      data: {
        name,
        email,
        message,
        userId: session?.user.id || null,
      },
    });

    return { success: true, message: "Email sent successfully" };
  } catch {
    return { success: false, message: "Failed to send email" };
  }
}

