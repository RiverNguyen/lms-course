"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Lightbulb } from "lucide-react";

export const LMSIntroductionSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Giới thiệu về TunaLMS
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            TunaLMS là nền tảng học tập trực tuyến hàng đầu, được thiết kế để mang đến 
            trải nghiệm học tập tốt nhất cho mọi người. Chúng tôi cam kết cung cấp nội dung 
            chất lượng cao, công nghệ tiên tiến và hỗ trợ tận tâm để giúp bạn đạt được mục tiêu học tập.
          </p>
        </motion.div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-8">
                <motion.div
                  className="flex flex-col items-center text-center space-y-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="p-4 rounded-full bg-primary/10"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Target className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold">Sứ Mệnh</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Chúng tôi cam kết mang đến nền tảng học tập trực tuyến chất lượng cao, 
                    giúp mọi người tiếp cận kiến thức một cách dễ dàng và hiệu quả, bất kể 
                    thời gian và địa điểm.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-8">
                <motion.div
                  className="flex flex-col items-center text-center space-y-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="p-4 rounded-full bg-primary/10"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Eye className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold">Tầm Nhìn</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Trở thành nền tảng học tập trực tuyến hàng đầu tại khu vực, nơi mọi người 
                    có thể phát triển kỹ năng, mở rộng kiến thức và thăng tiến trong sự nghiệp 
                    thông qua giáo dục chất lượng.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-8">
                <motion.div
                  className="flex flex-col items-center text-center space-y-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="p-4 rounded-full bg-primary/10"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Lightbulb className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold">Giá Trị Cốt Lõi</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Chất lượng, Đổi mới, Cam kết và Cộng đồng - những giá trị này định hướng 
                    mọi hoạt động của chúng tôi và đảm bảo trải nghiệm học tập tốt nhất cho học viên.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Platform Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-muted/30 border-2">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Nền Tảng Học Tập Hiện Đại
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  TunaLMS được xây dựng với công nghệ tiên tiến, mang đến trải nghiệm học tập 
                  mượt mà và tương tác cao. Với giao diện thân thiện, dễ sử dụng và hệ thống 
                  quản lý học tập thông minh, chúng tôi giúp học viên dễ dàng theo dõi tiến độ, 
                  tương tác với giảng viên và cộng đồng học viên.
                </p>
                <p>
                  Nền tảng của chúng tôi hỗ trợ đa dạng định dạng nội dung từ video, tài liệu, 
                  bài tập thực hành đến các buổi học trực tuyến. Mọi thứ được thiết kế để tối ưu 
                  hóa việc học tập và đảm bảo học viên có thể tiếp thu kiến thức một cách hiệu quả nhất.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
