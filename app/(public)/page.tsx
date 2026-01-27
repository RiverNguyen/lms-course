import { HeroSection } from "@/app/(public)/_components/hero-section";
import { FeaturedCoursesSection } from "@/app/(public)/_components/featured-courses-section";
import { LMSIntroSection } from "@/app/(public)/_components/lms-intro-section";
import { StatsSection } from "@/app/(public)/_components/stats-section";
import { TestimonialsSection } from "@/app/(public)/_components/testimonials-section";
import { RegistrationSection } from "@/app/(public)/_components/registration-section";
import { CTASection } from "@/app/(public)/_components/cta-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Online Learning Platform | TunaLMS",
  description:
    "Discover the leading online learning platform with thousands of high-quality courses. Learn anytime, anywhere with TunaLMS - the most modern LMS platform.",
  keywords: [
    "online courses",
    "online learning",
    "LMS platform",
    "e-learning",
    "online education",
    "online training",
    "course platform",
    "learn online",
  ],
  openGraph: {
    title: "TunaLMS - Leading Online Learning Platform",
    description:
      "Discover the leading online learning platform with thousands of high-quality courses.",
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
