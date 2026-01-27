import nodemailer from "nodemailer";
import { env } from "@/lib/env";

// Tạo transporter cho Gmail SMTP
export const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD, // Sử dụng App Password, không phải password thường
  },
});

// Interface cho email options
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

// Hàm gửi email qua Gmail
export const sendEmailViaGmail = async ({
  to,
  subject,
  html,
  from,
  replyTo,
}: SendEmailOptions) => {
  const recipients = Array.isArray(to) ? to : [to];
  
  // Format from field: nếu có format "Name <email>", giữ nguyên; nếu chỉ có name, thêm email
  let fromField = from || `TunaLMS`;
  if (!fromField.includes("<") && !fromField.includes("@")) {
    fromField = `${fromField} <${env.GMAIL_USER}>`;
  } else if (!fromField.includes("@")) {
    fromField = `${fromField} <${env.GMAIL_USER}>`;
  }
  
  await gmailTransporter.sendMail({
    from: fromField,
    to: recipients.join(", "),
    subject,
    html,
    replyTo,
  });
};
