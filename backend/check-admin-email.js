import "dotenv/config.js";
import pool from "./src/db/pool.js";

(async () => {
  try {
    const result = await pool.query(
      "SELECT userid, email, role FROM public.users WHERE role = 'admin' LIMIT 5",
    );
    console.log("Admin users:");
    result.rows.forEach((row) => {
      console.log(
        `  - userid: ${row.userid}, email: ${row.email}, role: ${row.role}`,
      );
    });
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
