import type { Metadata } from "next";
import { ContactFormSection } from "./_components/contact-form-section";
import { ContactInfoSection } from "./_components/contact-info-section";
import { SocialMediaSection } from "./_components/social-media-section";
import { GoogleMapSection } from "./_components/google-map-section";

export const metadata: Metadata = {
  title: "Contact Us - TunaLMS | Get in Touch",
  description:
    "Get in touch with TunaLMS. Contact us via email, phone, or visit our office. We're here to help you with any questions about our courses and platform.",
  keywords: [
    "contact TunaLMS",
    "LMS support",
    "online learning contact",
    "education support",
    "course inquiry",
  ],
  openGraph: {
    title: "Contact TunaLMS - Get in Touch",
    description:
      "Get in touch with TunaLMS. Contact us via email, phone, or visit our office.",
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
