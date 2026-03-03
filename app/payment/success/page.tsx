import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";
import PaymentSuccessContent from "./payment-success-content";

export const metadata: Metadata = {
  title: "Thanh toán Thành công",
  description: "Thanh toán của bạn đã được xử lý thành công. Bạn có thể truy cập khóa học và bắt đầu học ngay.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Thanh toán Thành công - TunaLMS",
    description: "Thanh toán của bạn đã được xử lý thành công. Bạn có thể truy cập khóa học ngay.",
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
