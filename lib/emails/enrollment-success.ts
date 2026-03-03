import { sendEmailViaGmail } from "@/lib/gmail";
import { env } from "@/lib/env";

interface EnrollmentSuccessEmailProps {
  userEmail: string;
  userName: string;
  courseTitle: string;
  courseSlug: string;
  amount: string;
  enrollmentId: string;
}

export const sendEnrollmentSuccessEmail = async ({
  userEmail,
  userName,
  courseTitle,
  courseSlug,
  amount,
  enrollmentId,
}: EnrollmentSuccessEmailProps) => {
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount));

  const courseUrl = `${env.BETTER_AUTH_URL}/courses/${courseSlug}`;
  const dashboardUrl = `${env.BETTER_AUTH_URL}/dashboard`;

  try {
    await sendEmailViaGmail({
      from: "TunaLMS",
      to: userEmail,
      subject: `Thanh toán thành công - Chào mừng đến với ${courseTitle}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f6f9fc;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f9fc;padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:600px;margin:0 auto;">
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Thanh toán thành công! 🎉</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 16px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Xin chào ${userName},
                        </p>
                        
                        <p style="margin:0 0 24px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Chúc mừng! Thanh toán của bạn đã được xử lý thành công. Bạn đã được ghi danh vào khóa học:
                        </p>
                        
                        <!-- Course Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;padding:20px;margin:24px 0;">
                          <tr>
                            <td>
                              <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:600;color:#111827;">
                                ${courseTitle}
                              </h2>
                              <p style="margin:0;font-size:14px;color:#6b7280;">
                                Mã ghi danh: ${enrollmentId}
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Payment Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
                          <tr>
                            <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                              <span style="font-size:14px;color:#6b7280;">Số tiền thanh toán:</span>
                              <span style="float:right;font-size:16px;font-weight:600;color:#111827;">${formattedAmount}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:12px 0;">
                              <span style="font-size:14px;color:#6b7280;">Status:</span>
                              <span style="float:right;font-size:14px;font-weight:600;color:#10b981;text-transform:uppercase;">Active</span>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA Buttons -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0;">
                          <tr>
                            <td align="center" style="padding:0;">
                              <table cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="border-radius:6px;background:#667eea;padding:12px 24px;">
                                    <a href="${courseUrl}" style="display:inline-block;text-decoration:none;color:#ffffff;font-weight:600;font-size:16px;">
                                      Bắt đầu học →
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
                          <tr>
                            <td align="center">
                              <a href="${dashboardUrl}" style="color:#667eea;text-decoration:none;font-size:14px;">
                                Xem tổng quan của tôi
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin:32px 0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
                          Bạn có thể truy cập tất cả tài liệu, video và tài nguyên của khóa học. Chúng tôi rất vui được đồng hành cùng bạn trên hành trình học tập!
                        </p>
                        
                        <p style="margin:24px 0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
                          Nếu có bất kỳ câu hỏi hoặc cần hỗ trợ, hãy liên hệ với đội ngũ hỗ trợ của chúng tôi.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                        <p style="margin:0 0 8px 0;font-size:14px;color:#6b7280;">
                          Chúc bạn học tập hiệu quả!
                        </p>
                        <p style="margin:0;font-size:12px;color:#9ca3af;">
                          — Đội ngũ TunaLMS
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send enrollment success email:", error);
    throw error;
  }
};
