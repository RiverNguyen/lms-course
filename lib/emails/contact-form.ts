import { sendEmailViaGmail } from "@/lib/gmail";
import { env } from "@/lib/env";

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Email gửi cho admin khi có form liên hệ mới
export const sendContactFormToAdmin = async ({
  name,
  email,
  phone,
  message,
}: ContactFormEmailProps) => {
  try {
    await sendEmailViaGmail({
      from: "TunaLMS Contact Form",
      to: "contact@tunalms.com", // Thay bằng email admin thực tế
      replyTo: email,
      subject: `Tin nhắn liên hệ mới từ ${name}`,
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
                        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Tin Nhắn Liên Hệ Mới</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 16px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Bạn có một tin nhắn liên hệ mới từ form trên website TunaLMS.
                        </p>
                        
                        <!-- Contact Info Card -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;padding:20px;margin:24px 0;">
                          <tr>
                            <td>
                              <table width="100%" cellpadding="8" cellspacing="0">
                                <tr>
                                  <td style="width:120px;font-weight:600;color:#374151;font-size:14px;">Họ Tên:</td>
                                  <td style="color:#1f2937;font-size:14px;">${name}</td>
                                </tr>
                                <tr>
                                  <td style="width:120px;font-weight:600;color:#374151;font-size:14px;">Email:</td>
                                  <td style="color:#1f2937;font-size:14px;">
                                    <a href="mailto:${email}" style="color:#667eea;text-decoration:none;">${email}</a>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="width:120px;font-weight:600;color:#374151;font-size:14px;">Số Điện Thoại:</td>
                                  <td style="color:#1f2937;font-size:14px;">
                                    <a href="tel:${phone}" style="color:#667eea;text-decoration:none;">${phone}</a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Message -->
                        <div style="background:#f9fafb;border-left:4px solid #667eea;padding:16px 20px;margin:24px 0;border-radius:4px;">
                          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#1f2937;">Nội Dung Tin Nhắn:</h3>
                          <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;white-space:pre-wrap;">${message}</p>
                        </div>
                        
                        <!-- Action Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0 0 0;">
                          <tr>
                            <td align="center">
                              <a href="mailto:${email}" style="display:inline-block;padding:12px 24px;background:#667eea;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Trả Lời Email</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
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
    console.error("Failed to send contact form email to admin:", error);
    throw error;
  }
};

// Email xác nhận gửi cho user
export const sendContactFormConfirmation = async ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  try {
    await sendEmailViaGmail({
      from: "TunaLMS",
      to: email,
      subject: "Cảm ơn bạn đã liên hệ với TunaLMS",
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
                        <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;">Cảm Ơn Bạn! 🙏</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 16px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Xin chào ${name},
                        </p>
                        
                        <p style="margin:0 0 24px 0;font-size:16px;color:#1f2937;line-height:1.6;">
                          Cảm ơn bạn đã liên hệ với TunaLMS! Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất có thể.
                        </p>
                        
                        <!-- Info Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;padding:20px;margin:24px 0;">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:14px;color:#0c4a6e;line-height:1.6;">
                                <strong>Thời gian phản hồi:</strong> Chúng tôi thường phản hồi trong vòng 24-48 giờ làm việc.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA -->
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px 0 0 0;">
                          <tr>
                            <td align="center">
                              <a href="${env.BETTER_AUTH_URL}/courses" style="display:inline-block;padding:12px 24px;background:#667eea;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Khám Phá Khóa Học</a>
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
                          Email: contact@tunalms.com | Phone: +84 123 456 789
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
    console.error("Failed to send contact form confirmation email:", error);
    throw error;
  }
};
