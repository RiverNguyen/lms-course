import Link from "next/link";
import { Facebook, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">TunaLMS</h3>
            <p className="text-sm text-muted-foreground">
              Nền tảng học trực tuyến hiện đại giúp bạn nâng cao kỹ năng và phát triển sự nghiệp.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@tunalms.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/courses"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Khóa học
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Bảng điều khiển
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Pháp lý</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chính sách hoàn tiền
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: contact@tunalms.com</li>
              <li>Điện thoại: +1 (555) 123-4567</li>
              <li>Giờ làm việc: 8:00 - 22:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TunaLMS. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};
