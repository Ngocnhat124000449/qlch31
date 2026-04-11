import "dotenv/config.js";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

/**
 * Script tạo banner với upload hình ảnh lên Cloudinary
 * Flow: Download/create image → gọi POST /api/banners → Cloudinary upload → DB save
 */

// Dữ liệu admin để gen token
const ADMIN_USER_ID = 1;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * Gen admin JWT token
 */
function generateAdminToken() {
  const token = jwt.sign(
    { userid: ADMIN_USER_ID, role: "admin", isAdmin: true },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
  return token;
}

/**
 * Download hình ảnh từ URL
 */
async function downloadImage(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to download image: ${response.statusText}`);

  const buffer = await response.buffer();
  fs.writeFileSync(outputPath, buffer);
  console.log(`📥 Downloaded image to: ${outputPath}`);
  return outputPath;
}

/**
 * Upload banner với hình ảnh lên backend
 */
async function createBannerWithUpload() {
  try {
    console.log("🚀 Bắt đầu tạo banner với upload hình ảnh...\n");

    // 1. Gen admin token
    console.log("1️⃣  Tạo admin JWT token...");
    const adminToken = generateAdminToken();
    console.log(`✅ Token: ${adminToken.substring(0, 50)}...\n`);

    // 2. Download hoặc tạo image test
    console.log("2️⃣  Chuẩn bị hình ảnh test...");
    const imagePath = path.join(process.cwd(), "banner-test.jpg");

    // Download sample banner image từ Unsplash
    const imageUrl =
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop";
    await downloadImage(imageUrl, imagePath);
    console.log(`✅ Hình ảnh: ${imagePath}\n`);

    // 3. Tạo FormData với file + metadata
    console.log("3️⃣  Tạo FormData để upload...");
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));
    formData.append("ten", "Banner Khuyến Mại - Cloudinary Upload");
    formData.append(
      "mota",
      "Banner test upload lên Cloudinary và lưu link vào database",
    );
    formData.append("linkurl", "https://example.com/promo");
    formData.append("vitri", "HOME_TOP");
    formData.append("thutuhienthi", "0");
    formData.append("trangthai", "true");
    console.log("✅ FormData tạo xong\n");

    // 4. Gọi endpoint POST /api/banners
    console.log("4️⃣  Gửi request POST /api/banners tới backend...");
    const endpoint = `${BACKEND_URL}/api/banners`;
    console.log(`📤 URL: ${endpoint}\n`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`❌ Lỗi (${response.status}):`, responseData.message);
      console.error("Full response:", JSON.stringify(responseData, null, 2));
      process.exit(1);
    }

    // 5. Log kết quả
    console.log("✅ Upload thành công!\n");
    console.log("📊 Banner data từ database:");
    console.log(JSON.stringify(responseData.data, null, 2));

    if (responseData.data?.imageurl) {
      console.log("\n🖼️  Image URL từ Cloudinary:");
      console.log(responseData.data.imageurl);
    }

    // 6. Clean up
    fs.unlinkSync(imagePath);
    console.log(`\n🧹 Xoá file tạm: ${imagePath}`);
    console.log("\n✅ Hoàn thành!");
  } catch (err) {
    console.error("\n❌ Lỗi:", err.message);
    console.error("Stack:", err.stack);
    process.exit(1);
  }
}

createBannerWithUpload();
