import type { Metadata } from "next";
import PaymentCancelPageContent from "./payment-cancel-content";

export const metadata: Metadata = {
  title: "Thanh toán Đã hủy",
  description: "Thanh toán của bạn đã bị hủy. Đừng lo! Bạn có thể thử lại sau. Thanh toán của bạn chưa được xử lý.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Thanh toán Đã hủy - TunaLMS",
    description: "Thanh toán của bạn đã bị hủy. Bạn có thể thử lại sau.",
    url: "/payment/cancel",
  },
};

export default function PaymentCancelPage() {
  return <PaymentCancelPageContent />;
}
