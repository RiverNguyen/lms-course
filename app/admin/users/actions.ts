"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";
import {
  sendUserBanNotification,
  sendUserUnbanNotification,
} from "@/lib/emails/user-ban";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 10,
  })
);

export const banUser = async (
  userId: string,
  banReason: string
): Promise<ApiResponse> => {
  const session = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session?.user.id as string,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests",
        };
      } else {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }
    }

    if (!userId) {
      return {
        status: "error",
        message: "User ID is required",
      };
    }

    if (!banReason || banReason.trim().length === 0) {
      return {
        status: "error",
        message: "Ban reason is required",
      };
    }

    // Get user info before banning
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true, email: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    if (user.role === "admin") {
      return {
        status: "error",
        message: "Cannot ban admin users",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: banReason.trim(),
        banExpires: null, // Permanent ban unless specified otherwise
      },
    });

    // Note: We don't delete sessions so user can login and see the banned page
    // The banned check in requireUser/requireAdmin and BannedCheck will handle redirects

    // Send email notification to user
    try {
      await sendUserBanNotification({
        userName: user.name,
        userEmail: user.email,
        banReason: banReason.trim(),
      });
    } catch (emailError) {
      console.error("Failed to send ban notification email:", emailError);
      // Continue even if email fails - the ban was successful
    }

    revalidatePath(`/admin/users`);

    return {
      status: "success",
      message: "User banned successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const unbanUser = async (userId: string): Promise<ApiResponse> => {
  const session = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session?.user.id as string,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "Too many requests",
        };
      } else {
        return {
          status: "error",
          message: "Unauthorized",
        };
      }
    }

    if (!userId) {
      return {
        status: "error",
        message: "User ID is required",
      };
    }

    // Get user info before unbanning
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    // Send email notification to user
    try {
      await sendUserUnbanNotification({
        userName: user.name,
        userEmail: user.email,
      });
    } catch (emailError) {
      console.error("Failed to send unban notification email:", emailError);
      // Continue even if email fails - the unban was successful
    }

    revalidatePath(`/admin/users`);

    return {
      status: "success",
      message: "User unbanned successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
