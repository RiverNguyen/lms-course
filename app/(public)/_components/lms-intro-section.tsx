"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Award, Globe, Users } from "lucide-react";
import { motion } from "motion/react";

const benefits = [
  {
    icon: Clock,
    title: "Học Mọi lúc, Mọi nơi",
    description:
      "Truy cập khóa học bất cứ khi nào bạn muốn, từ bất kỳ thiết bị nào. Học theo tốc độ của riêng bạn mà không bị giới hạn bởi thời gian hay địa điểm.",
  },
  {
    icon: Globe,
    title: "Danh mục Khóa học Đa dạng",
    description:
      "Hơn 1000+ khóa học đa dạng trên nhiều lĩnh vực, từ công nghệ thông tin, kinh doanh, thiết kế đến phát triển cá nhân.",
  },
  {
    icon: Award,
    title: "Chứng chỉ Sau khi Hoàn thành",
    description:
      "Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học, giúp bạn nâng cao hồ sơ và cơ hội nghề nghiệp.",
  },
  {
    icon: Users,
    title: "Cộng đồng Học tập",
    description:
      "Tham gia cộng đồng người học sôi động, trao đổi kiến thức và kết nối với những người cùng đam mê học tập.",
  },
];

export const LMSIntroSection = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tại sao Chọn TunaLMS?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            TunaLMS là nền tảng học tập trực tuyến hàng đầu được thiết kế để mang lại trải nghiệm học tập tốt nhất. 
            Chúng tôi cam kết cung cấp nội dung chất lượng cao, công nghệ tiên tiến và hỗ trợ tận tâm để giúp bạn đạt được mục tiêu học tập.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <motion.div
                      className="flex flex-col items-center text-center space-y-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="p-4 rounded-full bg-primary/10"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </motion.div>
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
