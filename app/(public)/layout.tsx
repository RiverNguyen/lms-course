import { Suspense } from "react";
import { Navbar } from "@/app/(public)/_components/navbar";
import { Footer } from "@/app/(public)/_components/footer";
import { ScrollToTop } from "@/app/(public)/_components/scroll-to-top";
import { AiAssistant } from "@/app/(public)/_components/ai-assistant";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Elevate your learning experience with TunaLMS. Discover a new way to learn with our modern, interactive learning management system. Access high-quality courses anytime, anywhere.",
  openGraph: {
    title: "TunaLMS - Elevate Your Learning Experience",
    description: "Discover a new way to learn with our modern, interactive learning management system. Access high-quality courses anytime, anywhere.",
    url: "/",
  },
};

const LayoutPublic = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16 border-b bg-background" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 pb-10">{children}</main>
      <Footer />
      <ScrollToTop />
      <AiAssistant />
    </div>
  );
};

export default LayoutPublic;
