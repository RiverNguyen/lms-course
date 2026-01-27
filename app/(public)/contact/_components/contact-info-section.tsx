"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    content: "contact@tunalms.com",
    link: "mailto:contact@tunalms.com",
    description: "Gửi email cho chúng tôi bất cứ lúc nào",
  },
  {
    icon: Phone,
    title: "Số Điện Thoại",
    content: "+84 123 456 789",
    link: "tel:+84123456789",
    description: "Gọi cho chúng tôi từ 8:00 - 22:00",
  },
  {
    icon: MapPin,
    title: "Địa Chỉ Văn Phòng",
    content: "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh",
    link: "https://maps.google.com",
    description: "Đến thăm văn phòng của chúng tôi",
  },
  {
    icon: Clock,
    title: "Giờ Làm Việc",
    content: "Thứ 2 - Chủ Nhật: 8:00 - 22:00",
    link: null,
    description: "Hỗ trợ 7 ngày trong tuần",
  },
];

export const ContactInfoSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Thông Tin Liên Hệ
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Chọn cách liên hệ phù hợp nhất với bạn. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            const ContentWrapper = info.link ? "a" : "div";
            
            return (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <ContentWrapper
                      href={info.link || undefined}
                      className={info.link ? "block" : ""}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <motion.div
                          className="p-4 rounded-full bg-primary/10"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="h-8 w-8 text-primary" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold mb-2">{info.title}</h3>
                          <p className="text-sm text-primary font-medium mb-1">
                            {info.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </ContentWrapper>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
