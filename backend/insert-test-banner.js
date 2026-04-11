import "dotenv/config.js";
import pool from "./src/db/pool.js";

async function insertTestBanner() {
  try {
    console.log(
      "📍 DATABASE_URL:",
      process.env.DATABASE_URL?.substring(0, 50) + "...",
    );
    const result = await pool.query(
      `
      INSERT INTO public.banner 
        (ten, mota, imageurl, linkurl, vitri, thutuhienthi, trangthai, thoigianbatdau, thoigianketthuc)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, NULL, NULL)
      RETURNING *;
    `,
      [
        "Test Banner Home Top",
        "Này là banner test mô tả sản phẩm khuyến mại",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop",
        "https://example.com/promo",
        "HOME_TOP",
        0,
        true,
      ],
    );

    console.log("✅ Banner test đã được thêm vào database:");
    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (err) {
    console.error("❌ Lỗi khi insert banner:", err.message);
  } finally {
    process.exit(0);
  }
}

insertTestBanner();
