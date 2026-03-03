import { PrismaClient } from "../lib/generated/prisma";
import slugify from "slugify";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Công nghệ Thông tin",
    description: "Học về lập trình, phát triển phần mềm và kiến thức cơ bản về CNTT",
  },
  {
    name: "Phát triển Web",
    description: "Thành thạo các công nghệ web frontend và backend, framework và best practices",
  },
  {
    name: "Khoa học Dữ liệu",
    description: "Khám phá phân tích dữ liệu, machine learning và trí tuệ nhân tạo",
  },
  {
    name: "Phát triển Mobile",
    description: "Xây dựng ứng dụng iOS và Android sử dụng các framework mobile hiện đại",
  },
  {
    name: "Thiết kế & UI/UX",
    description: "Tạo ra các giao diện và trải nghiệm người dùng đẹp mắt và thân thiện",
  },
  {
    name: "Kinh doanh & Tài chính",
    description: "Học về chiến lược kinh doanh, tài chính, marketing và khởi nghiệp",
  },
  {
    name: "Digital Marketing",
    description: "Thành thạo SEO, social media marketing, content marketing và analytics",
  },
  {
    name: "Nhiếp ảnh & Video",
    description: "Học kỹ thuật chụp ảnh, quay phim và chỉnh sửa chuyên nghiệp",
  },
  {
    name: "Học Ngôn ngữ",
    description: "Cải thiện kỹ năng ngôn ngữ của bạn với các khóa học toàn diện",
  },
  {
    name: "Phát triển Bản thân",
    description: "Nâng cao kỹ năng, năng suất và phát triển cá nhân của bạn",
  },
];

async function main() {
  console.log("🌱 Bắt đầu tạo danh mục...\n");

  let createdCount = 0;
  let skippedCount = 0;

  for (const category of categories) {
    const slug = slugify(category.name, { lower: true, locale: "vi" });

    try {
      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { slug },
      });

      if (existing) {
        console.log(`⏭️  Đã tồn tại: ${category.name} (${slug})`);
        skippedCount++;
        continue;
      }

      // Create category
      await prisma.category.create({
        data: {
          name: category.name,
          slug,
          description: category.description,
        },
      });

      console.log(`✅ Đã tạo: ${category.name} (${slug})`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Lỗi khi tạo ${category.name}:`, error);
    }
  }

  console.log(`\n📊 Kết quả:`);
  console.log(`   - Đã tạo: ${createdCount} danh mục`);
  console.log(`   - Đã bỏ qua: ${skippedCount} danh mục`);
  console.log(`   - Tổng cộng: ${categories.length} danh mục\n`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
