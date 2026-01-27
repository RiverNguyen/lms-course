import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendEmailViaGmail } from "@/lib/gmail";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await sendEmailViaGmail({
          from: "TunaLMS",
          to: email,
          subject: "TunaLMS - Verify your email",
          html: `
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f9fc;padding:24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
              <tr>
                <td align="center">
                  <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.08);">
                    <tr>
                      <td style="padding:24px 28px 12px 28px;text-align:left;">
                        <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">Verify your email</h1>
                        <p style="margin:8px 0 0 0;font-size:14px;color:#475569;">Enter this code in TunaLMS to finish signing in.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 28px 16px 28px;text-align:center;">
                        <div style="display:inline-block;padding:14px 20px;border:1px dashed #cbd5e1;border-radius:10px;font-size:26px;letter-spacing:6px;font-weight:700;color:#0f172a;background:#f8fafc;">
                          ${otp}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 28px 24px 28px;text-align:left;">
                        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">If you didn’t request this, you can ignore this email. The code expires in 10 minutes.</p>
                        <p style="margin:12px 0 0 0;font-size:13px;color:#94a3b8;">— The TunaLMS Team</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          `,
        });
      },
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      // Note: We handle banned users manually via BannedCheck component
      // This message is shown if better-auth blocks login, but we prefer to allow login and redirect
      bannedUserMessage:
        "You have been banned from this application. Please contact support if you believe this is an error.",
    }),
  ],
});
