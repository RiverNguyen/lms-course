import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { markNotificationRead } from "@/app/data/notification/mark-notification-read";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await markNotificationRead(id, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/notifications/[id]/read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification read" },
      { status: 500 }
    );
  }
}
