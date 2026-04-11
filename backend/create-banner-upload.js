import "dotenv/config.js";
import fs from "fs";
import path from "path";
import { createReadStream } from "fs";
import jwt from "jsonwebtoken";
import https from "https";
import http from "http";

/**
 * Script tạo banner với upload hình ảnh lên Cloudinary
 * Flow: Download image → gọi POST /api/banners → Cloudinary upload → DB save
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com"; // Một trong những admin account
const ADMIN_PASSWORD = "admin123"; // Từ setup script
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * Login để lấy token
 */
function loginAdmin() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BACKEND_URL}/api/auth/login`);
    const protocol = url.protocol === "https:" ? https : http;

    const postData = JSON.stringify({
      identifier: ADMIN_EMAIL, // email hoặc tendangnhap
      matkhau: ADMIN_PASSWORD,
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode !== 200) {
            reject(new Error(`Login failed: ${json.message}`));
          } else {
            // Response: { accessToken, refreshToken, user }
            resolve(json.accessToken);
          }
        } catch (err) {
          reject(new Error(`Failed to parse login response: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Download hình ảnh từ URL
 */
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, (response) => {
        const file = fs.createWriteStream(outputPath);
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`📥 Downloaded image to: ${outputPath}`);
          resolve(outputPath);
        });
      })
      .on("error", reject);
  });
}

/**
 * Upload banner với hình ảnh
 */
function uploadBannerViaAPI(endpoint, token, imagePath, bannerData) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(imagePath);
    const fileSize = fs.statSync(imagePath).size;

    // Tạo multipart/form-data body
    const boundary =
      "----FormBoundary" + Math.random().toString(36).substring(2);
    let body = "";

    // Thêm file part
    body = `--${boundary}\r\n`;
    body +=
      'Content-Disposition: form-data; name="image"; filename="banner.jpg"\r\n';
    body += "Content-Type: image/jpeg\r\n\r\n";

    // Thêm text fields
    const fields = bannerData;
    Object.entries(fields).forEach(([key, value]) => {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      body += `${value}\r\n`;
    });

    body += `--${boundary}--\r\n`;

    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
    };

    const protocol = endpoint.startsWith("https") ? https : http;
    const req = protocol.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (err) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on("error", reject);

    // Write body start
    req.write(body);

    // Pipe file
    fileStream.pipe(req, { end: false });

    fileStream.on("end", () => {
      req.end();
    });
  });
}

async function createBannerWithUpload() {
  try {
    console.log("🚀 Bắt đầu tạo banner với upload hình ảnh...\n");

    // 1. Login admin
    console.log("1️⃣  Đăng nhập admin để lấy session token...");
    const adminToken = await loginAdmin();
    console.log(`✅ Token: ${adminToken.substring(0, 50)}...\n`);

    // 2. Download image test
    console.log("2️⃣  Chuẩn bị hình ảnh test...");
    const imagePath = path.join(process.cwd(), "temp-banner.jpg");
    const imageUrl =
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop";

    await downloadImage(imageUrl, imagePath);
    console.log(`✅ Hình ảnh: ${imagePath}\n`);

    // 3. Gọi endpoint POST /api/banners
    console.log("3️⃣  Upload hình ảnh lên Cloudinary qua backend API...");
    const endpoint = `${BACKEND_URL}/api/banners`;
    console.log(`📤 Endpoint: ${endpoint}\n`);

    const bannerMetadata = {
      ten:
        "Banner Cloudinary Upload - " + new Date().toISOString().slice(0, 10),
      mota: "Banner test upload lên Cloudinary và lưu link vào database",
      linkurl: "https://example.com/promo",
      vitri: "HOME_TOP",
      thutuhienthi: "0",
      trangthai: "true",
    };

    const response = await uploadBannerViaAPI(
      endpoint,
      adminToken,
      imagePath,
      bannerMetadata,
    );

    if (response.status !== 201 && response.status !== 200) {
      console.error(`❌ Lỗi (${response.status}):`, response.body.message);
      console.error("Response:", JSON.stringify(response.body, null, 2));
      fs.unlinkSync(imagePath);
      process.exit(1);
    }

    // 4. Log kết quả
    console.log("✅ Upload thành công!\n");
    console.log("📊 Banner data từ database:");
    const bannerData = response.body.data;
    console.log(JSON.stringify(bannerData, null, 2));

    if (bannerData?.imageurl) {
      console.log("\n🖼️  Image URL từ Cloudinary:");
      console.log(bannerData.imageurl);
    }

    // 5. Test lấy banner qua API
    console.log("\n4️⃣  Kiểm tra banner trên /api/banners...");
    const fetchResponse = await new Promise((resolve, reject) => {
      const url = new URL(`${BACKEND_URL}/api/banners`);
      const protocol = url.protocol === "https:" ? https : http;
      const req = protocol.get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: JSON.parse(data) }),
        );
      });
      req.on("error", reject);
    });

    const bannerList = fetchResponse.body.data || [];
    console.log(`✅ Tổng banner trong hệ thống: ${bannerList.length}`);
    const lastBanner = bannerList[0];
    if (lastBanner) {
      console.log("📌 Banner mới nhất:");
      console.log(`  - ID: ${lastBanner.bannerid}`);
      console.log(`  - Tên: ${lastBanner.ten}`);
      console.log(`  - Image: ${lastBanner.imageurl?.substring(0, 60)}...`);
    }

    // 6. Clean up
    fs.unlinkSync(imagePath);
    console.log(`\n🧹 Xoá file tạm: ${imagePath}`);
    console.log("\n✅ Hoàn thành!");
  } catch (err) {
    console.error("\n❌ Lỗi:", err.message);
    if (err.stack) console.error("Stack:", err.stack);
    process.exit(1);
  }
}

createBannerWithUpload();
