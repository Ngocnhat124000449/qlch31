/**
 * src/tools/admin/user-management.js
 * Admin user management utilities
 */

import "dotenv/config.js";
import pg from "pg";
const { Pool } = pg;

// Create pool directly
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * List all admin users
 */
export async function listAdminUsers() {
  try {
    const result = await pool.query(
      "SELECT userid, email, tendangnhap, role, trangthai FROM public.users WHERE role = 'admin' ORDER BY userid ASC",
    );

    console.log("👥 Admin Users:");
    console.log("─".repeat(80));
    result.rows.forEach((user) => {
      const status = user.trangthai ? "✅" : "❌";
      console.log(
        `${status} ID: ${user.userid}, Email: ${user.email}, Username: ${user.tendangnhap}, Role: ${user.role}`,
      );
    });
    console.log("─".repeat(80));
    console.log(`Total: ${result.rows.length} admin user(s)\n`);

    return result.rows;
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

/**
 * Get admin by email or userid
 */
export async function getAdminUser(identifier) {
  try {
    let query, params;

    if (Number.isInteger(parseInt(identifier))) {
      query =
        "SELECT userid, email, tendangnhap, role, trangthai FROM public.users WHERE userid = $1 AND role = 'admin'";
      params = [identifier];
    } else {
      query =
        "SELECT userid, email, tendangnhap, role, trangthai FROM public.users WHERE email = $1 AND role = 'admin'";
      params = [identifier];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      console.log(`❌ Admin user not found: ${identifier}\n`);
      return null;
    }

    const user = result.rows[0];
    const status = user.trangthai ? "Active" : "Inactive";
    console.log(`👤 Admin User Found:`);
    console.log(`   ID: ${user.userid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.tendangnhap}`);
    console.log(`   Status: ${status}\n`);

    return user;
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

/**
 * Set admin password
 */
export async function setAdminPassword(identifier, newPassword) {
  try {
    const bcrypt = (await import("bcryptjs")).default;

    // Find admin user
    let query =
      "SELECT userid FROM public.users WHERE role = 'admin' AND (userid = $1 OR email = $1)";
    let result = await pool.query(query, [identifier]);

    if (result.rows.length === 0) {
      throw new Error(`Admin user not found: ${identifier}`);
    }

    const userid = result.rows[0].userid;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updateQuery =
      "UPDATE public.users SET matkhau = $1 WHERE userid = $2 RETURNING userid, email";
    result = await pool.query(updateQuery, [hashedPassword, userid]);

    const user = result.rows[0];
    console.log(`✅ Password updated for: ${user.email}\n`);

    return user;
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

/**
 * Disable/Enable admin user
 */
export async function toggleAdminStatus(identifier, active) {
  try {
    const status = active ? true : false;
    const statusLabel = active ? "Active" : "Inactive";

    const query =
      "UPDATE public.users SET trangthai = $1 WHERE role = 'admin' AND (userid = $2 OR email = $2) RETURNING userid, email, trangthai";
    const result = await pool.query(query, [status, identifier]);

    if (result.rows.length === 0) {
      throw new Error(`Admin user not found: ${identifier}`);
    }

    const user = result.rows[0];
    console.log(`✅ Admin user ${statusLabel}: ${user.email}\n`);

    return user;
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

// CLI interface
const isMainModule = process.argv[1]?.includes("user-management.js");

if (isMainModule) {
  console.log("Running CLI mode");
  const command = process.argv[2];
  console.log("Command:", command);

  (async () => {
    try {
      if (command === "list") {
        await listAdminUsers();
      } else if (command === "get" && process.argv[3]) {
        await getAdminUser(process.argv[3]);
      } else if (command === "password" && process.argv[3] && process.argv[4]) {
        await setAdminPassword(process.argv[3], process.argv[4]);
      } else if (command === "enable" && process.argv[3]) {
        await toggleAdminStatus(process.argv[3], true);
      } else if (command === "disable" && process.argv[3]) {
        await toggleAdminStatus(process.argv[3], false);
      } else {
        console.log(`Admin User Management Tool

Usage:
  node src/tools/admin/user-management.js list                  # List all admin users
  node src/tools/admin/user-management.js get <id|email>       # Get admin user details
  node src/tools/admin/user-management.js password <id> <pass>  # Set admin password
  node src/tools/admin/user-management.js enable <id|email>    # Enable admin user
  node src/tools/admin/user-management.js disable <id|email>   # Disable admin user

npm scripts:
  npm run tool:admin:list
  npm run tool:admin:get -- admin@gmail.com
  npm run tool:admin:password -- admin@gmail.com newpass123
  npm run tool:admin:enable -- admin@gmail.com
`);
      }
      process.exit(0);
    } catch (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
  })();
}
