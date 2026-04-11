import "dotenv/config.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import https from "https";
import http from "http";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const BACKEND_URL = "http://localhost:5001";

/**
 * Login admin
 */
function loginAdmin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      identifier: ADMIN_EMAIL,
      matkhau: ADMIN_PASSWORD,
    });

    const options = {
      hostname: "localhost",
      port: 5001,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode !== 200) reject(new Error(json.message));
          else resolve(json.accessToken);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Download image
 */
function downloadImage(url, outputPath) {
  try {
    execSync(`curl -s -o "${outputPath}" "${url}"`);
    console.log(`📥 Downloaded to: ${outputPath}`);
    return outputPath;
  } catch (err) {
    throw new Error(`Download failed: ${err.message}`);
  }
}

async function main() {
  try {
    console.log("🚀 Banner upload via Cloudinary\n");

    // 1. Login
    console.log("1️⃣  Logging in admin...");
    const token = await loginAdmin();
    console.log(`✅ Token obtained\n`);

    // 2. Download image
    console.log("2️⃣  Downloading test image...");
    const imagePath = path.join(process.cwd(), "temp-banner.jpg");
    await new Promise((resolve, reject) => {
      https
        .get(
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop",
          (res) => {
            const file = fs.createWriteStream(imagePath);
            res.pipe(file);
            file.on("finish", () => {
              file.close();
              console.log(`✅ Image: ${imagePath}\n`);
              resolve();
            });
          },
        )
        .on("error", reject);
    });

    // 3. Upload via curl
    console.log("3️⃣  Uploading to Cloudinary via API...");
    const curlCommand = `curl -X POST http://localhost:5001/api/banners \
  -H "Authorization: Bearer ${token}" \
  -F 'ten=Banner Cloudinary Upload - $(Get-Date -f "yyyy-MM-dd")' \
  -F 'mota=Banner test upload to Cloudinary and save URL to database' \
  -F 'linkurl=https://example.com/promo' \
  -F 'vitri=HOME_TOP' \
  -F 'thutuhienthi=0' \
  -F 'trangthai=true' \
  -F 'image=@"${imagePath}"' \
  -s | jq .`;

    const result = execSync(curlCommand, { encoding: "utf8", shell: "pwsh" });
    console.log("API Response:");
    console.log(result);

    // 4. Cleanup
    fs.unlinkSync(imagePath);
    console.log(`\n✅ Done!`);
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  }
}

main();
