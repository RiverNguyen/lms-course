import type { Metadata } from "next";
import { LMSIntroductionSection } from "./_components/lms-introduction-section";
import { WhyChooseSection } from "./_components/why-choose-section";
import { TeamSection } from "./_components/team-section";

export const metadata: Metadata = {
  title: "Giới thiệu - TunaLMS | Tìm hiểu về Nền tảng của Chúng tôi",
  description:
    "Khám phá TunaLMS - nền tảng học tập trực tuyến hàng đầu. Tìm hiểu về sứ mệnh, tầm nhìn, đội ngũ của chúng tôi và lý do hàng nghìn học viên chọn chúng tôi cho hành trình giáo dục của họ.",
  keywords: [
    "giới thiệu TunaLMS",
    "nền tảng LMS",
    "giáo dục trực tuyến",
    "hệ thống quản lý học tập",
    "công nghệ giáo dục",
    "nền tảng học trực tuyến",
  ],
  openGraph: {
    title: "Giới thiệu TunaLMS - Nền tảng Học tập Trực tuyến Hàng đầu",
    description:
      "Khám phá TunaLMS - nền tảng học tập trực tuyến hàng đầu. Tìm hiểu về sứ mệnh, tầm nhìn và đội ngũ của chúng tôi.",
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
