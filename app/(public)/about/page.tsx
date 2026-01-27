import type { Metadata } from "next";
import { LMSIntroductionSection } from "./_components/lms-introduction-section";
import { WhyChooseSection } from "./_components/why-choose-section";
import { TeamSection } from "./_components/team-section";

export const metadata: Metadata = {
  title: "About Us - TunaLMS | Learn More About Our Platform",
  description:
    "Discover TunaLMS - a leading online learning platform. Learn about our mission, vision, team, and why thousands of students choose us for their education journey.",
  keywords: [
    "about TunaLMS",
    "LMS platform",
    "online education",
    "learning management system",
    "education technology",
    "online learning platform",
  ],
  openGraph: {
    title: "About TunaLMS - Leading Online Learning Platform",
    description:
      "Discover TunaLMS - a leading online learning platform. Learn about our mission, vision, and team.",
    url: "/about",
  },
  alternates: {
    canonical: "/about",
  },
};

const AboutPage = () => {
  return (
    <>
      <LMSIntroductionSection />
      <WhyChooseSection />
      <TeamSection />
    </>
  );
};

export default AboutPage;
