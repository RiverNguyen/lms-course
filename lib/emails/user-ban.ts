import { sendEmailViaGmail } from "@/lib/gmail";
import { env } from "@/lib/env";

interface UserBanEmailProps {
  userName: string;
  userEmail: string;
  banReason: string;
}

// Email thông báo ban gửi cho user
export const sendUserBanNotification = async ({
  userName,
  userEmail,
  banReason,
}: UserBanEmailProps) => {
  try {
    await sendEmailViaGmail({
      from: "TunaLMS",
      to: userEmail,
      subject: "Thông báo về tài khoản của bạn - TunaLMS",
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
                      <td style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%);padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Thông Báo Quan Trọng</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 16px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Xin chào ${userName},
                        </p>
                        
                        <p style="margin:0 0 24px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Chúng tôi rất tiếc phải thông báo rằng tài khoản của bạn trên TunaLMS đã bị khóa do vi phạm điều khoản sử dụng của chúng tôi.
                        </p>
                        
                        <!-- Ban Reason Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fef2f2;border-radius:8px;border:1px solid #fecaca;padding:20px;margin:24px 0;">
                          <tr>
                            <td>
                              <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#991b1b;">Lý do khóa tài khoản:</h3>
                              <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;white-space:pre-wrap;">${banReason}</p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Info Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;padding:20px;margin:24px 0;">
                          <tr>
                            <td>
                              <p style="margin:0 0 12px 0;font-size:14px;color:#0c4a6e;line-height:1.6;">
                                <strong>Điều này có nghĩa là:</strong>
                              </p>
                              <ul style="margin:0;padding-left:20px;color:#0c4a6e;font-size:14px;line-height:1.8;">
                                <li>Bạn không thể đăng nhập vào tài khoản của mình</li>
                                <li>Bạn không thể truy cập các khóa học đã đăng ký</li>
                                <li>Tất cả các quyền truy cập đã bị thu hồi</li>
                              </ul>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Contact Info -->
                        <p style="margin:24px 0 0 0;font-size:14px;color:#4b5563;line-height:1.6;">
                          Nếu bạn cho rằng đây là một sự nhầm lẫn hoặc muốn khiếu nại về quyết định này, vui lòng liên hệ với chúng tôi qua email:
                        </p>
                        <p style="margin:8px 0 24px 0;font-size:14px;color:#667eea;">
                          <a href="mailto:contact@tunalms.com" style="color:#667eea;text-decoration:none;font-weight:600;">contact@tunalms.com</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                        <p style="margin:0 0 8px 0;font-size:14px;color:#1f2937;font-weight:600;">Đội Ngũ TunaLMS</p>
                        <p style="margin:0;font-size:12px;color:#6b7280;">
                          Email này được gửi tự động từ hệ thống TunaLMS
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
    console.error("Failed to send user ban notification email:", error);
    throw error;
  }
};

interface UserUnbanEmailProps {
  userName: string;
  userEmail: string;
}

// Email thông báo unban gửi cho user
export const sendUserUnbanNotification = async ({
  userName,
  userEmail,
}: UserUnbanEmailProps) => {
  try {
    await sendEmailViaGmail({
      from: "TunaLMS",
      to: userEmail,
      subject: "Tài khoản của bạn đã được khôi phục - TunaLMS",
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
                      <td style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Tài Khoản Đã Được Khôi Phục! ✅</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 16px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Xin chào ${userName},
                        </p>
                        
                        <p style="margin:0 0 24px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Chúng tôi vui mừng thông báo rằng tài khoản của bạn trên TunaLMS đã được khôi phục và bạn có thể tiếp tục sử dụng dịch vụ của chúng tôi.
                        </p>
                        
                        <!-- Info Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;padding:20px;margin:24px 0;">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:14px;color:#065f46;line-height:1.6;">
                                <strong>Bạn có thể:</strong>
                              </p>
                              <ul style="margin:12px 0 0 0;padding-left:20px;color:#065f46;font-size:14px;line-height:1.8;">
                                <li>Đăng nhập vào tài khoản của mình</li>
                                <li>Truy cập các khóa học đã đăng ký</li>
                                <li>Sử dụng tất cả các tính năng của TunaLMS</li>
                              </ul>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0 0 0;">
                          <tr>
                            <td align="center">
                              <a href="${env.BETTER_AUTH_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Truy Cập Dashboard</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                        <p style="margin:0 0 8px 0;font-size:14px;color:#1f2937;font-weight:600;">Đội Ngũ TunaLMS</p>
                        <p style="margin:0;font-size:12px;color:#6b7280;">
                          Email này được gửi tự động từ hệ thống TunaLMS
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
    console.error("Failed to send user unban notification email:", error);
    throw error;
  }
};
