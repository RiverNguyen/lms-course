import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEnrollmentSuccessEmail } from "@/lib/emails/enrollment-success";
import { headers } from "next/headers";
import Stripe from "stripe";

export const POST = async (req: Request) => {
  const body = await req.text();

  const headerList = await headers();

  const signature = headerList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Webhook verification failed", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const customerId = session.customer as string;
    const orderId = session.metadata?.orderId as string;
    const orderType = session.metadata?.type as string;

    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerId: customerId
      }
    })

    if (!user) {
      throw new Error('User not found');
    }

    // Handle cart checkout
    if (orderType === 'cart' && orderId) {
      // Update order status
      const order = await prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          status: 'Completed',
        },
        include: {
          orderItems: true,
        }
      })

      // Create enrollments for each course in the order
      for (const orderItem of order.orderItems) {
        // Check if enrollment already exists
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: orderItem.courseId,
            }
          }
        })

        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId: orderItem.courseId,
              amount: orderItem.coursePrice,
              status: 'Active',
            }
          })
        } else if (existingEnrollment.status !== 'Active') {
          await prisma.enrollment.update({
            where: {
              id: existingEnrollment.id
            },
            data: {
              status: 'Active',
              amount: orderItem.coursePrice,
            }
          })
        }
      }
    } 
    // Handle single course enrollment (existing flow)
    else {
      const courseId = session.metadata?.courseId as string;
      const enrollmentId = session.metadata?.enrollmentId as string;

      if (!courseId) {
        throw new Error('Course ID is required');
      }

      if (!enrollmentId) {
        throw new Error('Enrollment ID is required');
      }

      // Get course information for email
      const course = await prisma.course.findUnique({
        where: {
          id: courseId
        },
        select: {
          title: true,
          slug: true,
        }
      })

      if (!course) {
        throw new Error('Course not found');
      }

      // Update enrollment status
      await prisma.enrollment.update({
        where: {
          id: enrollmentId
        },
        data: {
          userId: user.id,
          courseId: courseId,
          amount: session.amount_total?.toString() as string,
          status: 'Active',
        }
      })

      // Send enrollment success email
      try {
        await sendEnrollmentSuccessEmail({
          userEmail: user.email,
          userName: user.name,
          courseTitle: course.title,
          courseSlug: course.slug,
          amount: session.amount_total?.toString() || '0',
          enrollmentId: enrollmentId,
        });
      } catch (emailError) {
        // Log email error but don't fail the webhook
        console.error('Failed to send enrollment success email:', emailError);
      }
    }
  }

  return new Response(null, { status: 200 });
}