import { HeroSection } from "@/app/(public)/_components/hero-section";
import { FeaturedCoursesSection } from "@/app/(public)/_components/featured-courses-section";
import { LMSIntroSection } from "@/app/(public)/_components/lms-intro-section";
import { StatsSection } from "@/app/(public)/_components/stats-section";
import { TestimonialsSection } from "@/app/(public)/_components/testimonials-section";
import { RegistrationSection } from "@/app/(public)/_components/registration-section";
import { CTASection } from "@/app/(public)/_components/cta-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ - Nền tảng Học tập Trực tuyến | TunaLMS",
  description:
    "Khám phá nền tảng học tập trực tuyến hàng đầu với hàng nghìn khóa học chất lượng cao. Học mọi lúc, mọi nơi với TunaLMS - nền tảng LMS hiện đại nhất.",
  keywords: [
    "khóa học trực tuyến",
    "học trực tuyến",
    "nền tảng LMS",
    "e-learning",
    "giáo dục trực tuyến",
    "đào tạo trực tuyến",
    "nền tảng khóa học",
    "học online",
  ],
  openGraph: {
    title: "TunaLMS - Nền tảng Học tập Trực tuyến Hàng đầu",
    description:
      "Khám phá nền tảng học tập trực tuyến hàng đầu với hàng nghìn khóa học chất lượng cao.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturedCoursesSection />
      <LMSIntroSection />
      <StatsSection />
      <TestimonialsSection />
      <RegistrationSection />
      <CTASection />
    </>
  );
};

export default HomePage;
