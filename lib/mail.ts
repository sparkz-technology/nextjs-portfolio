import nodemailer from "nodemailer";

import { constant } from "@/configs/constant";

const { EMAIL, PASSWORD } = constant;

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});
