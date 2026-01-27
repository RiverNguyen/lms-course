"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  BookOpen,
  Award,
  Globe,
  Users,
  TrendingUp,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

const reasons = [
  {
    icon: Clock,
    title: "Học Trực Tuyến Linh Hoạt",
    description:
      "Học mọi lúc, mọi nơi với thiết bị của bạn. Không bị giới hạn bởi thời gian hay địa điểm, bạn có thể tự điều chỉnh tốc độ học tập phù hợp với lịch trình cá nhân.",
    color: "text-blue-500",
  },
  {
    icon: BookOpen,
    title: "Đa Dạng Khóa Học",
    description:
      "Hơn 1000+ khóa học đa dạng từ công nghệ thông tin, kinh doanh, thiết kế đến phát triển cá nhân. Nội dung được cập nhật thường xuyên bởi các chuyên gia hàng đầu.",
    color: "text-purple-500",
  },
  {
    icon: Award,
    title: "Chứng Chỉ Có Giá Trị",
    description:
      "Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học. Chứng chỉ của chúng tôi giúp bạn nâng cao hồ sơ và cơ hội nghề nghiệp trong thị trường việc làm cạnh tranh.",
    color: "text-amber-500",
  },
  {
    icon: Globe,
    title: "Tiếp Cận Toàn Cầu",
    description:
      "Học từ các giảng viên quốc tế và kết nối với cộng đồng học viên trên toàn thế giới. Mở rộng tầm nhìn và hiểu biết của bạn thông qua giáo dục đa văn hóa.",
    color: "text-green-500",
  },
  {
    icon: Users,
    title: "Cộng Đồng Học Tập",
    description:
      "Tham gia cộng đồng học viên sôi động, trao đổi kiến thức, chia sẻ kinh nghiệm và kết nối với những người có cùng đam mê học tập. Học hỏi từ nhau và cùng phát triển.",
    color: "text-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Phát Triển Sự Nghiệp",
    description:
      "Các khóa học được thiết kế để giúp bạn phát triển kỹ năng thực tế, áp dụng ngay vào công việc. Nhiều học viên đã thăng tiến trong sự nghiệp nhờ kiến thức từ TunaLMS.",
    color: "text-red-500",
  },
  {
    icon: Smartphone,
    title: "Học Mọi Nơi",
    description:
      "Ứng dụng di động thân thiện cho phép bạn học trên điện thoại và máy tính bảng. Đồng bộ tiến độ học tập trên mọi thiết bị, không bao giờ bỏ lỡ bài học.",
    color: "text-indigo-500",
  },
  {
    icon: CheckCircle2,
    title: "Chất Lượng Được Đảm Bảo",
    description:
      "Mọi khóa học đều trải qua quy trình kiểm duyệt nghiêm ngặt. Chúng tôi cam kết chỉ cung cấp nội dung chất lượng cao, cập nhật và có giá trị thực tế cho học viên.",
    color: "text-teal-500",
  },
];

export const WhyChooseSection = () => {
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
            Tại Sao Chọn TunaLMS?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Khám phá những lý do khiến hàng nghìn học viên tin tưởng và lựa chọn TunaLMS 
            làm đối tác học tập của họ
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                  <CardContent className="p-6">
                    <motion.div
                      className="flex flex-col space-y-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className={`p-4 rounded-xl bg-primary/10 w-fit ${reason.color}`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="h-8 w-8" />
                      </motion.div>
                      <h3 className="text-xl font-bold leading-tight">
                        {reason.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {reason.description}
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Sẵn Sàng Bắt Đầu Hành Trình Học Tập?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Tham gia cùng hàng nghìn học viên đang phát triển kỹ năng và thăng tiến 
                trong sự nghiệp với TunaLMS
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
                >
                  Khám Phá Khóa Học
                </a>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
