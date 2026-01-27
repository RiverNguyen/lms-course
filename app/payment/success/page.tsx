import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import PaymentSuccessContent from "./payment-success-content";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your payment has been processed successfully. You can now access your course and start learning.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Payment Successful - TunaLMS",
    description: "Your payment has been processed successfully. You can now access your course.",
    url: "/payment/success",
  },
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex flex-1 justify-center items-center">
        <Card className="w-full max-w-[400px]">
          <CardContent className="p-8">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
