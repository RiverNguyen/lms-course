import type { Metadata } from "next";
import PaymentCancelPageContent from "./payment-cancel-content";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled. No worries! You can try again later. Your payment was not processed.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Payment Cancelled - TunaLMS",
    description: "Your payment was cancelled. You can try again later.",
    url: "/payment/cancel",
  },
};

export default function PaymentCancelPage() {
  return <PaymentCancelPageContent />;
}
