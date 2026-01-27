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
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) / 100);

  const courseUrl = `${env.BETTER_AUTH_URL}/courses/${courseSlug}`;
  const dashboardUrl = `${env.BETTER_AUTH_URL}/dashboard`;

  try {
    await sendEmailViaGmail({
      from: "TunaLMS",
      to: userEmail,
      subject: `Payment Successful - Welcome to ${courseTitle}!`,
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
                        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Payment Successful! 🎉</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 16px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Hi ${userName},
                        </p>
                        
                        <p style="margin:0 0 24px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Congratulations! Your payment has been processed successfully. You are now enrolled in:
                        </p>
                        
                        <!-- Course Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;padding:20px;margin:24px 0;">
                          <tr>
                            <td>
                              <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:600;color:#111827;">
                                ${courseTitle}
                              </h2>
                              <p style="margin:0;font-size:14px;color:#6b7280;">
                                Enrollment ID: ${enrollmentId}
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Payment Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
                          <tr>
                            <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                              <span style="font-size:14px;color:#6b7280;">Amount Paid:</span>
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
                                      Start Learning →
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
                                View My Dashboard
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin:32px 0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
                          You can now access all course materials, videos, and resources. We're excited to have you on this learning journey!
                        </p>
                        
                        <p style="margin:24px 0 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
                          If you have any questions or need assistance, feel free to reach out to our support team.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                        <p style="margin:0 0 8px 0;font-size:14px;color:#6b7280;">
                          Happy Learning!
                        </p>
                        <p style="margin:0;font-size:12px;color:#9ca3af;">
                          — The TunaLMS Team
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
