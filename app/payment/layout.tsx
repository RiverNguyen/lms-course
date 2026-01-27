import type { Metadata } from "next";

// Metadata for payment pages - can be overridden by individual pages
export const metadata: Metadata = {
  title: "Payment",
  description: "Complete your course purchase and start learning today.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
