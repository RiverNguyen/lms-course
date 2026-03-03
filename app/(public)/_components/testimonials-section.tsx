"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Lập trình viên",
    image: "https://avatar.vercel.sh/sarah",
    rating: 5,
    comment:
      "TunaLMS đã thay đổi trải nghiệm học tập của tôi. Các khóa học rất toàn diện và giảng viên rất xuất sắc. Tôi đã có được những kỹ năng quý giá giúp tôi thăng tiến trong sự nghiệp.",
  },
  {
    name: "Michael Chen",
    role: "Quản lý Marketing",
    image: "https://avatar.vercel.sh/michael",
    rating: 5,
    comment:
      "Tính linh hoạt để học theo tốc độ của riêng tôi trong khi có quyền truy cập vào hướng dẫn chuyên gia thật tuyệt vời. Nền tảng rất trực quan và chất lượng nội dung rất xuất sắc.",
  },
  {
    name: "Emily Rodriguez",
    role: "Nhà thiết kế",
    image: "https://avatar.vercel.sh/emily",
    rating: 5,
    comment:
      "Tôi đã hoàn thành nhiều khóa học trên TunaLMS và mỗi khóa học đều vượt quá mong đợi của tôi. Các dự án thực tế và ví dụ thực tế làm cho việc học trở nên hấp dẫn và hiệu quả.",
  },
  {
    name: "David Thompson",
    role: "Nhà phân tích Kinh doanh",
    image: "https://avatar.vercel.sh/david",
    rating: 5,
    comment:
      "Chứng chỉ tôi nhận được từ TunaLMS đã giúp tôi có được công việc mơ ước. Các khóa học được cấu trúc tốt và sự hỗ trợ từ cộng đồng thật tuyệt vời.",
  },
];

export const TestimonialsSection = () => {
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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Học viên Nói gì về Chúng tôi
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn người học hài lòng đã thay đổi sự nghiệp của họ với các khóa học của chúng tôi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
