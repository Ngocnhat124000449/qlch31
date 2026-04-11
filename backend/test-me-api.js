import { pool } from "./src/db/db.js";
import { signAccessToken } from "./src/utils/jwt.js";

(async () => {
  try {
    // Get admin user
    const { rows } = await pool.query(
      "SELECT userid, email, role FROM public.users WHERE userid = $1",
      ["25"],
    );

    const user = rows[0];
    const sid = 1; // dummy session id

    // Generate token
    const token = signAccessToken({ userid: user.userid, sid });
    console.log("Generated token:", token.substring(0, 50) + "...");

    // Now test with fetch
    const response = await fetch("http://localhost:5001/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const meData = await response.json();
    console.log("ME API Response:", JSON.stringify(meData, null, 2));

    if (meData.user) {
      console.log("\nKey fields:");
      console.log("- userid:", meData.user.userid);
      console.log("- email:", meData.user.email);
      console.log("- role:", meData.user.role);
      console.log("- isAdmin:", meData.user.isAdmin);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
