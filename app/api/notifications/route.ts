import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getNotifications,
  getUnreadCount,
} from "@/app/data/notification/get-notifications";
import { markAllNotificationsRead } from "@/app/data/notification/mark-notification-read";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;

    const [result, unreadCount] = await Promise.all([
      getNotifications(session.user.id, cursor),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({
      list: result.list,
      nextCursor: result.nextCursor,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.readAll === true) {
      await markAllNotificationsRead(session.user.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
