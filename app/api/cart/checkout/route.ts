import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/store/cart-store";

interface CheckoutRequest {
  items: CartItem[];
  subtotal: number;
  total: number;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    // Validate request
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Giỏ hàng trống" },
        { status: 400 }
      );
    }

    // Verify courses exist
    const courseIds = body.items.map((item) => item.id);
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true, price: true, slug: true },
    });

    if (courses.length !== body.items.length) {
      return NextResponse.json(
        { success: false, message: "Một số khóa học không tồn tại" },
        { status: 400 }
      );
    }

    // Generate order number
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          subtotal: body.subtotal.toFixed(2),
          total: body.total.toFixed(2),
          status: "Pending",
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: body.items.map((item) => ({
          orderId: newOrder.id,
          courseId: item.id,
          courseTitle: item.title,
          courseSlug: item.slug,
          coursePrice: item.price,
          quantity: item.quantity,
        })),
      });


      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: "Đặt hàng thành công",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo đơn hàng",
      },
      { status: 500 }
    );
  }
}
