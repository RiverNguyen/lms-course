import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader'
import { BannedCheck } from "@/components/banned-check";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TunaLMS - Hệ thống Quản lý Học tập Trực tuyến",
    template: "%s | TunaLMS",
  },
  description: "Khám phá hệ thống quản lý học tập trực tuyến hiện đại và tương tác. Truy cập các khóa học chất lượng cao mọi lúc, mọi nơi. Học từ các chuyên gia hàng đầu và nâng cao kỹ năng với các khóa học trực tuyến toàn diện.",
  keywords: ["học trực tuyến", "LMS", "khóa học", "giáo dục", "e-learning", "khóa học trực tuyến", "nền tảng học tập", "phát triển kỹ năng"],
  authors: [{ name: "TunaLMS" }],
  creator: "TunaLMS",
  publisher: "TunaLMS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "TunaLMS",
    title: "TunaLMS - Hệ thống Quản lý Học tập Trực tuyến",
    description: "Khám phá hệ thống quản lý học tập trực tuyến hiện đại và tương tác. Truy cập các khóa học chất lượng cao mọi lúc, mọi nơi.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TunaLMS - Nền tảng Học tập Trực tuyến",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TunaLMS - Hệ thống Quản lý Học tập Trực tuyến",
    description: "Khám phá hệ thống quản lý học tập trực tuyến hiện đại và tương tác. Truy cập các khóa học chất lượng cao mọi lúc, mọi nơi.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning suppressContentEditableWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BannedCheck />
          {children}
          <Toaster closeButton theme="dark" richColors />
          <NextTopLoader
            color='linear-gradient(90deg, #89f7fe 0%, #66a6ff 100%)'
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={true}
            easing='ease'
            speed={200}
            shadow='0 0 10px #2299DD,0 0 5px #2299DD'
            template='<div class="bar" role="bar"><div class="peg"></div></div>
    <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
            zIndex={1600}
            showAtBottom={false}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
