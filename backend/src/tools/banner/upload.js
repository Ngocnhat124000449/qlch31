/**
 * src/tools/banner/upload.js
 * Upload banner image to Cloudinary and save URL to database
 *
 * Usage: node --input-type=module -e "import('./src/tools/banner/upload.js').then(m => m.uploadBanner())"
 * Or: npm run tool:banner:upload
 */

import "dotenv/config.js";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/**
 * HTTP request helper
 */
function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === "https:" ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || { "Content-Type": "application/json" },
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (err) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body: data });
          } else {
            reject(new Error(`Parse error: ${data}`));
          }
        }
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

/**
 * Create multipart form data
 */
function createMultipartBody(fields, fileBuffer, filename) {
  const boundary =
    "----WebKitFormBoundary" + Math.random().toString(36).substring(2, 15);
  const crlf = "\r\n";
  let body = [];

  // Add fields
  for (const [key, value] of Object.entries(fields)) {
    body.push(`--${boundary}`);
    body.push(`Content-Disposition: form-data; name="${key}"`);
    body.push("");
    body.push(String(value));
  }

  // Add file
  body.push(`--${boundary}`);
  body.push(
    `Content-Disposition: form-data; name="image"; filename="${filename}"`,
  );
  body.push("Content-Type: image/jpeg");
  body.push("");

  const bodyStr = body.join(crlf) + crlf;
  const bodyEnd = crlf + `--${boundary}--${crlf}`;

  return {
    buffer: Buffer.concat([
      Buffer.from(bodyStr),
      fileBuffer,
      Buffer.from(bodyEnd),
    ]),
    boundary,
  };
}

/**
 * Download image from URL
 */
function downloadImage(imgUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = imgUrl.startsWith("https") ? https : http;
    protocol
      .get(imgUrl, (res) => {
        const file = fs.createWriteStream(outputPath);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", reject);
  });
}

/**
 * Main upload function
 */
export async function uploadBanner(options = {}) {
  const {
    imageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop",
    bannerName = `Banner Upload - ${new Date().toISOString().slice(0, 10)}`,
    description = "Banner uploaded via automated tool",
    position = "HOME_TOP",
    link = "https://example.com",
  } = options;

  let imagePath;
  try {
    console.log("🚀 Banner Upload Tool\n");

    // 1. Login
    console.log("1️⃣  Logging in admin...");
    const loginRes = await httpRequest(
      `${BACKEND_URL}/api/auth/login`,
      { method: "POST" },
      JSON.stringify({ identifier: ADMIN_EMAIL, matkhau: ADMIN_PASSWORD }),
    );

    if (loginRes.status !== 200 && loginRes.status !== 201) {
      throw new Error(`Login failed: ${loginRes.body.message}`);
    }
    const token = loginRes.body.accessToken;
    console.log(`✅ Logged in\n`);

    // 2. Download image
    console.log("2️⃣  Downloading image...");
    imagePath = path.join(process.cwd(), "temp-banner.jpg");
    await downloadImage(imageUrl, imagePath);
    console.log(`✅ Downloaded\n`);

    // 3. Upload to backend
    console.log("3️⃣  Uploading to backend (Cloudinary)...");
    const imageBuffer = fs.readFileSync(imagePath);

    const fields = {
      ten: bannerName,
      mota: description,
      linkurl: link,
      vitri: position,
      thutuhienthi: "0",
      trangthai: "true",
    };

    const { buffer, boundary } = createMultipartBody(
      fields,
      imageBuffer,
      "banner.jpg",
    );

    const urlObj = new URL(`${BACKEND_URL}/api/banners`);
    const uploadOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": buffer.length,
      },
    };

    const uploadRes = await new Promise((resolve, reject) => {
      const req = http.request(uploadOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, body: json });
          } catch (err) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on("error", reject);
      req.write(buffer);
      req.end();
    });

    if (uploadRes.status !== 201 && uploadRes.status !== 200) {
      throw new Error(
        `Upload failed (${uploadRes.status}): ${uploadRes.body.message}`,
      );
    }

    console.log(`✅ Upload successful!\n`);
    console.log("📊 Banner Data:");
    const bannerData = uploadRes.body.data;
    console.log(JSON.stringify(bannerData, null, 2));

    if (bannerData?.imageurl) {
      console.log("\n🖼️  Cloudinary URL:");
      console.log(bannerData.imageurl);
    }

    // 4. Verify
    console.log("\n4️⃣  Verifying...");
    const listRes = await httpRequest(`${BACKEND_URL}/api/banners`);
    const bannerCount = listRes.body.data?.length || 0;
    console.log(`✅ Total banners: ${bannerCount}`);

    console.log("\n✅ Complete!");
    return bannerData;
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  } finally {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadBanner();
}
