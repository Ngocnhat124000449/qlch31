import bcrypt from "bcryptjs";
import { pool } from "./src/db/db.js";

(async () => {
  try {
    // Hash mật khẩu "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log("Hashed password:", hashedPassword);

    // Update admin account password
    const res = await pool.query(
      "UPDATE public.users SET matkhau = $1 WHERE tendangnhap = $2 RETURNING userid, email, tendangnhap",
      [hashedPassword, "admin"],
    );

    console.log("Updated admin:", res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
