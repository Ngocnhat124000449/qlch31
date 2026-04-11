const pg = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "./backend/.env") });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const res = await pool.query(
      "SELECT userid, email, tendangnhap, role FROM public.users ORDER BY userid LIMIT 20",
    );
    console.log("All users:", res.rows);

    const adminRes = await pool.query(
      "SELECT userid, email, tendangnhap, role FROM public.users WHERE role = $1",
      ["admin"],
    );
    console.log("\nAdmin users:", adminRes.rows);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
