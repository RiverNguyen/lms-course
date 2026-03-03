import { PrismaClient } from "../lib/generated/prisma";
import slugify from "slugify";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Placeholder image key - bạn có thể thay bằng fileKey thật từ S3 hoặc upload ảnh sau
const PLACEHOLDER_FILE_KEY = "courses/placeholder.png";

// Dùng raw SQL để tránh lỗi khi Prisma client có schema cũ (ví dụ galleryKeys) khác với DB thực tế
type CourseRow = { id: string };

const sampleCourses = [
  {
    title: "Lập trình Python từ cơ bản đến nâng cao",
    smallDescription: "Học Python từ zero, xây dựng ứng dụng thực tế và tự động hóa công việc.",
    description: "<p>Khóa học toàn diện về Python cho người mới bắt đầu. Bạn sẽ học cú pháp, cấu trúc dữ liệu, lập trình hướng đối tượng, xử lý file, gọi API và viết script tự động hóa. Kết thúc khóa bạn có thể tự tin tham gia dự án hoặc học tiếp Data Science, Web.</p>",
    price: "499000",
    duration: "24.5",
    level: "Beginner" as const,
  },
  {
    title: "React & Next.js - Xây dựng ứng dụng web hiện đại",
    smallDescription: "Master React 19, Next.js 16, Server Components và xây dựng sản phẩm production-ready.",
    description: "<p>Khóa học thực chiến về React và Next.js. Bao gồm hooks, state management, Server/Client Components, routing, data fetching, authentication và deploy. Phù hợp người đã biết HTML/CSS/JS cơ bản.</p>",
    price: "799000",
    duration: "32",
    level: "Intermediate" as const,
  },
  {
    title: "Machine Learning với Python",
    smallDescription: "Từ lý thuyết đến thực hành: regression, classification, NLP và model deployment.",
    description: "<p>Giới thiệu Machine Learning với scikit-learn, pandas, numpy. Học các thuật toán cơ bản, đánh giá mô hình, xử lý dữ liệu và giới thiệu Deep Learning. Có bài tập và project thực tế.</p>",
    price: "899000",
    duration: "40",
    level: "Advanced" as const,
  },
  {
    title: "Thiết kế Figma cho người mới bắt đầu",
    smallDescription: "Tạo giao diện, prototype và design system chuyên nghiệp với Figma.",
    description: "<p>Học Figma từ cơ bản: frames, components, auto layout, variants, prototyping và collaboration. Áp dụng cho UI/UX và handoff cho dev. Không cần kinh nghiệm thiết kế trước.</p>",
    price: "399000",
    duration: "18",
    level: "Beginner" as const,
  },
  {
    title: "Digital Marketing - Chiến lược tiếp thị số",
    smallDescription: "SEO, quảng cáo Facebook/Google, content và đo lường hiệu quả chiến dịch.",
    description: "<p>Khóa học tổng quan về digital marketing: xây dựng chiến lược, SEO, SEM, social ads, email marketing, content và phân tích dữ liệu. Có case study và bài tập thực hành.</p>",
    price: "599000",
    duration: "28",
    level: "Intermediate" as const,
  },
  {
    title: "Tiếng Anh giao tiếp cho doanh nghiệp",
    smallDescription: "Nâng cao kỹ năng giao tiếp, thuyết trình và đàm phán bằng tiếng Anh trong môi trường công sở.",
    description: "<p>Tập trung vào tiếng Anh thương mại: meeting, email, thuyết trình, đàm phán và networking. Học qua tình huống thực tế, role-play và feedback. Phù hợp trình độ pre-intermediate trở lên.</p>",
    price: "449000",
    duration: "20",
    level: "Intermediate" as const,
  },
  {
    title: "Quản lý dự án với Agile & Scrum",
    smallDescription: "Vận hành sprint, backlog, ceremony và vai trò Scrum Master trong team.",
    description: "<p>Hiểu framework Agile và Scrum: values, roles, artifacts, events. Thực hành planning, daily standup, retrospective và cách áp dụng vào dự án thật. Phù hợp PM, dev, BA muốn làm việc Agile.</p>",
    price: "549000",
    duration: "22",
    level: "Beginner" as const,
  },
  {
    title: "Excel nâng cao - Phân tích dữ liệu",
    smallDescription: "Pivot Table, công thức nâng cao, Power Query và báo cáo trực quan với Excel.",
    description: "<p>Nâng cao kỹ năng Excel: hàm nâng cao, Pivot Table, Power Query, định dạng có điều kiện, biểu đồ và dashboard. Ứng dụng vào báo cáo tài chính, bán hàng và quản lý dữ liệu.</p>",
    price: "349000",
    duration: "16",
    level: "Intermediate" as const,
  },
  {
    title: "Content Writing - Viết nội dung thu hút",
    smallDescription: "Kỹ thuật viết blog, copywriting và nội dung cho website, social và quảng cáo.",
    description: "<p>Học cách viết nội dung hấp dẫn cho web, blog, social và ads. Bao gồm cấu trúc bài, headline, CTA, SEO content và tone of voice. Có bài tập và chỉnh sửa thực tế.</p>",
    price: "379000",
    duration: "14",
    level: "Beginner" as const,
  },
  {
    title: "Docker & Kubernetes - Container hóa ứng dụng",
    smallDescription: "Đóng gói ứng dụng bằng Docker, triển khai và scale với Kubernetes.",
    description: "<p>Khóa học DevOps: Docker images, Dockerfile, docker-compose, Kubernetes concepts, Pods, Deployments, Services và cơ bản về Helm. Giúp bạn vận hành và deploy ứng dụng trên container.</p>",
    price: "699000",
    duration: "26",
    level: "Advanced" as const,
  },
];

async function main() {
  console.log("🌱 Bắt đầu tạo khóa học...\n");

  const categories = await prisma.category.findMany({ take: 10 });
  const admin = await prisma.user.findFirst({
    where: { role: "admin" },
    select: { id: true },
  });

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < sampleCourses.length; i++) {
    const course = sampleCourses[i];
    const slug = slugify(course.title, { lower: true, locale: "vi" });

    try {
      const existing = await prisma.$queryRawUnsafe<CourseRow[]>(
        'SELECT id FROM "Course" WHERE slug = $1',
        slug
      );

      if (existing.length > 0) {
        console.log(`⏭️  Đã tồn tại: ${course.title} (${slug})`);
        skippedCount++;
        continue;
      }

      const categoryId = categories[i % categories.length]?.id ?? null;
      const id = randomUUID();
      const now = new Date();

      await prisma.$executeRawUnsafe(
        `INSERT INTO "Course" (id, title, description, "fileKey", price, duration, level, "stripePriceId", "categoryId", "smallDescription", slug, status, "createdAt", "updatedAt", "userId")
         VALUES ($1, $2, $3, $4, $5, $6, $7::"CourseLevel", $8, $9, $10, $11, $12::"CourseStatus", $13, $14, $15)`,
        id,
        course.title,
        course.description,
        PLACEHOLDER_FILE_KEY,
        course.price,
        course.duration,
        course.level,
        null,
        categoryId,
        course.smallDescription,
        slug,
        "Published",
        now,
        now,
        admin?.id ?? null
      );

      console.log(`✅ Đã tạo: ${course.title} (${slug})`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Lỗi khi tạo "${course.title}":`, error);
    }
  }

  console.log(`\n📊 Kết quả:`);
  console.log(`   - Đã tạo: ${createdCount} khóa học`);
  console.log(`   - Đã bỏ qua: ${skippedCount} khóa học`);
  console.log(`   - Tổng: ${sampleCourses.length} khóa học\n`);
  console.log("💡 Lưu ý: Các khóa học dùng ảnh placeholder. Vào Admin > Khóa học để chỉnh sửa và thêm ảnh/Stripe nếu cần.\n");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
