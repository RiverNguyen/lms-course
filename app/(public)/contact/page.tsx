import type { Metadata } from "next";
import { ContactFormSection } from "./_components/contact-form-section";
import { ContactInfoSection } from "./_components/contact-info-section";
import { SocialMediaSection } from "./_components/social-media-section";
import { GoogleMapSection } from "./_components/google-map-section";

export const metadata: Metadata = {
  title: "Liên hệ - TunaLMS | Liên hệ với Chúng tôi",
  description:
    "Liên hệ với TunaLMS. Gửi email, gọi điện thoại hoặc đến văn phòng của chúng tôi. Chúng tôi sẵn sàng hỗ trợ bạn với mọi câu hỏi về khóa học và nền tảng của chúng tôi.",
  keywords: [
    "liên hệ TunaLMS",
    "hỗ trợ LMS",
    "liên hệ học trực tuyến",
    "hỗ trợ giáo dục",
    "tư vấn khóa học",
  ],
  openGraph: {
    title: "Liên hệ TunaLMS - Liên hệ với Chúng tôi",
    description:
      "Liên hệ với TunaLMS. Gửi email, gọi điện thoại hoặc đến văn phòng của chúng tôi.",
    url: "/contact",
  },
  alternates: {
    canonical: "/contact",
  },
};

const ContactPage = () => {
  return (
    <>
      <ContactFormSection />
      <ContactInfoSection />
      <SocialMediaSection />
      <GoogleMapSection />
    </>
  );
};

export default ContactPage;
