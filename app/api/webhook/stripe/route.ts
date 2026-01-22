import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
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
    const courseId = session.metadata?.courseId as string;
    const customerId = session.customer as string;

    if (!courseId) {
      throw new Error('Course ID is required');
    }

    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerId: customerId
      }
    })

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.enrollment.update({
      where: {
        id: session.metadata?.enrollmentId as string
      },
      data: {
        userId: user.id,
        courseId: courseId,
        amount: session.amount_total?.toString() as string,
        status: 'Active',
      }
    })
  }

  return new Response(null, { status: 200 });
}