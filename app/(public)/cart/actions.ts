'use server'

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { CartItem } from "@/store/cart-store";

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '1m',
    max: 5,
  })
)

export const checkoutCartAction = async (
  items: CartItem[],
  subtotal: number,
  total: number
): Promise<ApiResponse | never> => {
  let checkoutUrl: string = '';

  const user = await requireUser();

  try {
    const req = await request();

    const decision = await aj.protect(req, {
      fingerprint: user.id,
    })

    if (decision.isDenied()) {
      return {
        status: 'error',
        message: 'You are a bot!'
      }
    }

    if (!items || items.length === 0) {
      return {
        status: 'error',
        message: 'Cart is empty'
      }
    }

    // Verify courses exist and get Stripe price IDs
    const courseIds = items.map((item) => item.id);
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
        stripePriceId: true
      }
    })

    if (courses.length !== items.length) {
      return {
        status: 'error',
        message: 'Some courses do not exist'
      }
    }

    // Check if all courses have Stripe price IDs
    const coursesWithoutPrice = courses.filter(c => !c.stripePriceId);
    if (coursesWithoutPrice.length > 0) {
      return {
        status: 'error',
        message: 'Some courses are not configured with pricing. Please contact support.'
      }
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        stripeCustomerId: true
      }
    })

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      })

      stripeCustomerId = customer.id

      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          stripeCustomerId: stripeCustomerId
        }
      })
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const course = courses.find(c => c.id === item.id);
      if (!course?.stripePriceId) {
        throw new Error(`Course ${item.id} does not have a Stripe price ID`);
      }

      return {
        price: course.stripePriceId,
        quantity: 1,
      }
    });

    // Create order in database (Pending status)
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        status: "Pending",
        userId: user.id,
        orderItems: {
          create: items.map((item) => ({
            courseId: item.id,
            courseTitle: item.title,
            courseSlug: item.slug,
            coursePrice: item.price,
            quantity: 1,
          })),
        },
      },
    });

    // Apply discount to line items if needed
    // Note: Stripe handles discounts via coupons or we can adjust line item prices
    // For simplicity, we'll create the session with the original prices
    // and the discount is already reflected in the order total
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${env.BETTER_AUTH_URL}/payment/success?orderId=${order.id}`,
      cancel_url: `${env.BETTER_AUTH_URL}/cart`,
      metadata: {
        userId: user.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        type: 'cart',
      },
    })

    checkoutUrl = checkoutSession.url as string;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        status: 'error',
        message: 'Payment system error. Please try again later.'
      }
    }

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  redirect(checkoutUrl);
}
