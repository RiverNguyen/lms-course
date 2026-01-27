"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Mail } from "lucide-react";

const founders = [
  {
    name: "Nguyễn Văn A",
    role: "Co-Founder & CEO",
    image: "https://avatar.vercel.sh/nguyen-van-a",
    bio: "Với hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục và công nghệ, anh đã dẫn dắt TunaLMS từ ý tưởng đến nền tảng hàng đầu.",
    linkedin: "https://linkedin.com",
    email: "nguyenvana@tunalms.com",
  },
  {
    name: "Trần Thị B",
    role: "Co-Founder & CTO",
    image: "https://avatar.vercel.sh/tran-thi-b",
    bio: "Chuyên gia công nghệ với niềm đam mê xây dựng nền tảng học tập hiện đại, đảm bảo trải nghiệm tốt nhất cho người dùng.",
    linkedin: "https://linkedin.com",
    email: "tranthib@tunalms.com",
  },
  {
    name: "Lê Văn C",
    role: "Co-Founder & Head of Education",
    image: "https://avatar.vercel.sh/le-van-c",
    bio: "Nhà giáo dục với tầm nhìn về tương lai của học tập trực tuyến, chịu trách nhiệm về chất lượng nội dung và chương trình đào tạo.",
    linkedin: "https://linkedin.com",
    email: "levanc@tunalms.com",
  },
];

const instructors = [
  {
    name: "Phạm Thị D",
    role: "Senior Instructor - Web Development",
    image: "https://avatar.vercel.sh/pham-thi-d",
    bio: "Full-stack developer với 8+ năm kinh nghiệm, chuyên về React, Node.js và cloud technologies.",
    courses: "15+ khóa học",
    students: "10K+ học viên",
  },
  {
    name: "Hoàng Văn E",
    role: "Senior Instructor - Data Science",
    image: "https://avatar.vercel.sh/hoang-van-e",
    bio: "Data scientist và AI researcher, từng làm việc tại các công ty công nghệ hàng đầu.",
    courses: "12+ khóa học",
    students: "8K+ học viên",
  },
  {
    name: "Vũ Thị F",
    role: "Senior Instructor - UI/UX Design",
    image: "https://avatar.vercel.sh/vu-thi-f",
    bio: "Designer với portfolio ấn tượng, chuyên về user experience và interface design hiện đại.",
    courses: "18+ khóa học",
    students: "12K+ học viên",
  },
  {
    name: "Đỗ Văn G",
    role: "Senior Instructor - Digital Marketing",
    image: "https://avatar.vercel.sh/do-van-g",
    bio: "Marketing expert với hơn 10 năm kinh nghiệm, giúp hàng trăm doanh nghiệp phát triển thương hiệu.",
    courses: "10+ khóa học",
    students: "7K+ học viên",
  },
  {
    name: "Bùi Thị H",
    role: "Senior Instructor - Mobile Development",
    image: "https://avatar.vercel.sh/bui-thi-h",
    bio: "Mobile app developer chuyên về iOS và Android, đã phát triển nhiều ứng dụng thành công.",
    courses: "14+ khóa học",
    students: "9K+ học viên",
  },
  {
    name: "Ngô Văn I",
    role: "Senior Instructor - Business & Finance",
    image: "https://avatar.vercel.sh/ngo-van-i",
    bio: "Business consultant và financial analyst, chuyên tư vấn chiến lược và quản lý tài chính.",
    courses: "11+ khóa học",
    students: "6K+ học viên",
  },
];

export const TeamSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Founders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Đội Ngũ Sáng Lập
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Những người đã xây dựng và phát triển TunaLMS với tầm nhìn về một nền tảng 
              giáo dục trực tuyến xuất sắc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={founder.image} alt={founder.name} />
                          <AvatarFallback className="text-2xl">
                            {founder.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{founder.name}</h3>
                        <p className="text-sm text-primary font-medium mb-3">
                          {founder.role}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {founder.bio}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <motion.a
                            href={founder.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors cursor-pointer"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </motion.a>
                          <motion.a
                            href={`mailto:${founder.email}`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors cursor-pointer"
                            aria-label="Email"
                          >
                            <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </motion.a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Instructors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Đội Ngũ Giảng Viên
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Học từ những chuyên gia hàng đầu trong lĩnh vực của họ, với nhiều năm kinh nghiệm 
              thực tế và đam mê chia sẻ kiến thức
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructors.map((instructor, index) => (
              <motion.div
                key={instructor.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                          <AvatarImage src={instructor.image} alt={instructor.name} />
                          <AvatarFallback>
                            {instructor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{instructor.name}</h3>
                        <p className="text-sm text-primary font-medium mb-2">
                          {instructor.role}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {instructor.bio}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary">
                            {instructor.courses}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary">
                            {instructor.students}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join Team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Muốn Trở Thành Giảng Viên?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Nếu bạn là chuyên gia trong lĩnh vực của mình và muốn chia sẻ kiến thức, 
                hãy tham gia đội ngũ giảng viên của chúng tôi
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="/#contact"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
                >
                  Liên Hệ Chúng Tôi
                </a>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
