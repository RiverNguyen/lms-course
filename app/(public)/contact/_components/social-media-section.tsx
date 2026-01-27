"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Github,
} from "lucide-react";

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/tunalms",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    description: "Theo dõi chúng tôi trên Facebook",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: "https://linkedin.com/company/tunalms",
    color: "text-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    description: "Kết nối với chúng tôi trên LinkedIn",
  },
  {
    name: "Twitter",
    icon: Twitter,
    url: "https://twitter.com/tunalms",
    color: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-950",
    description: "Theo dõi cập nhật trên Twitter",
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com/@tunalms",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    description: "Xem video hướng dẫn trên YouTube",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://instagram.com/tunalms",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    description: "Theo dõi chúng tôi trên Instagram",
  },
  {
    name: "GitHub",
    icon: Github,
    url: "https://github.com/tunalms",
    color: "text-gray-900 dark:text-gray-100",
    bgColor: "bg-gray-50 dark:bg-gray-950",
    description: "Xem mã nguồn mở trên GitHub",
  },
];

export const SocialMediaSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Kết Nối Với Chúng Tôi
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Theo dõi chúng tôi trên các kênh mạng xã hội để cập nhật tin tức, 
            khóa học mới và các sự kiện đặc biệt.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <motion.div
                        className={`p-4 rounded-xl ${social.bgColor} ${social.color}`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-6 w-6 md:h-8 md:w-8" />
                      </motion.div>
                      <div>
                        <h3 className="text-sm md:text-base font-bold mb-1">
                          {social.name}
                        </h3>
                        <p className="text-xs text-muted-foreground hidden md:block">
                          {social.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
