import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/zod-schemas";
import {
  sendContactFormToAdmin,
  sendContactFormConfirmation,
} from "@/lib/emails/contact-form";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate form data
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Dữ liệu không hợp lệ",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = validationResult.data;

    // Send email to admin
    try {
      await sendContactFormToAdmin({
        name,
        email,
        phone,
        message,
      });
    } catch (emailError) {
      console.error("Failed to send email to admin:", emailError);
      // Continue even if admin email fails, but log the error
    }

    // Send confirmation email to user
    try {
      await sendContactFormConfirmation({
        name,
        email,
      });
    } catch (confirmationError) {
      console.error("Failed to send confirmation email:", confirmationError);
      // Continue even if confirmation email fails
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
      },
      { status: 500 }
    );
  }
}
