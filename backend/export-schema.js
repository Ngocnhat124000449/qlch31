import pg from "pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function exportSchema() {
  try {
    console.log("🔄 Connecting to database...");
    const client = await pool.connect();

    // Get all tables
    console.log("📋 Fetching tables...");
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows;
    console.log(`✅ Found ${tables.length} tables`);

    let sql = `-- Schema exported from Neon database
-- Generated at: ${new Date().toISOString()}

BEGIN;

CREATE SCHEMA IF NOT EXISTS public;

`;

    // For each table, get its definition
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`📝 Processing table: ${tableName}`);

      // Get columns
      const columnsResult = await client.query(
        `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `,
        [tableName],
      );

      // Build CREATE TABLE statement
      sql += `CREATE TABLE IF NOT EXISTS "public"."${tableName}" (\n`;

      const columns = columnsResult.rows;
      columns.forEach((col, index) => {
        let columnDef = `  "${col.column_name}" ${col.data_type.toUpperCase()}`;

        // Add size constraints for character types
        if (col.character_maximum_length) {
          columnDef = `  "${col.column_name}" ${col.data_type.toUpperCase()}(${col.character_maximum_length})`;
        }

        // Add precision for numeric types
        if (col.numeric_precision) {
          if (col.numeric_scale) {
            columnDef = `  "${col.column_name}" ${col.data_type.toUpperCase()}(${col.numeric_precision},${col.numeric_scale})`;
          } else {
            columnDef = `  "${col.column_name}" ${col.data_type.toUpperCase()}(${col.numeric_precision})`;
          }
        }

        // Add SERIAL if type is bigserial or serial
        if (col.data_type === "bigserial" || col.data_type === "serial") {
          columnDef = `  "${col.column_name}" ${col.data_type.toUpperCase()}`;
        }

        // Add default value
        if (col.column_default) {
          columnDef += ` DEFAULT ${col.column_default}`;
        }

        // Add NOT NULL constraint
        if (col.is_nullable === "NO") {
          columnDef += ` NOT NULL`;
        }

        columnDef += index === columns.length - 1 ? "\n" : ",\n";
        sql += columnDef;
      });

      sql += `);\n\n`;
    }

    // Get all constraints (foreign keys, unique, check, etc.)
    console.log("🔗 Fetching constraints...");
    const constraintsResult = await client.query(`
      SELECT constraint_name, constraint_type, table_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND constraint_type != 'CHECK'
      ORDER BY table_name, constraint_type
    `);

    // Process each constraint
    for (const constraint of constraintsResult.rows) {
      const { constraint_name, constraint_type, table_name } = constraint;

      if (constraint_type === "PRIMARY KEY") {
        const pkColsResult = await client.query(
          `
          SELECT column_name
          FROM information_schema.key_column_usage
          WHERE constraint_schema = 'public' 
            AND table_name = $1 
            AND constraint_name = $2
          ORDER BY ordinal_position
        `,
          [table_name, constraint_name],
        );

        if (pkColsResult.rows.length > 0) {
          const cols = pkColsResult.rows
            .map((r) => `"${r.column_name}"`)
            .join(", ");
          sql += `ALTER TABLE ONLY "public"."${table_name}"\n`;
          sql += `  ADD CONSTRAINT "${constraint_name}" PRIMARY KEY (${cols});\n\n`;
        }
      } else if (constraint_type === "UNIQUE") {
        const uniqueColsResult = await client.query(
          `
          SELECT column_name
          FROM information_schema.key_column_usage
          WHERE constraint_schema = 'public' 
            AND table_name = $1 
            AND constraint_name = $2
          ORDER BY ordinal_position
        `,
          [table_name, constraint_name],
        );

        if (uniqueColsResult.rows.length > 0) {
          const cols = uniqueColsResult.rows
            .map((r) => `"${r.column_name}"`)
            .join(", ");
          sql += `ALTER TABLE ONLY "public"."${table_name}"\n`;
          sql += `  ADD CONSTRAINT "${constraint_name}" UNIQUE (${cols});\n\n`;
        }
      } else if (constraint_type === "FOREIGN KEY") {
        const fkResult = await client.query(
          `
          SELECT 
            kcu.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column,
            rc.update_rule,
            rc.delete_rule
          FROM information_schema.key_column_usage kcu
          JOIN information_schema.referential_constraints rc 
            ON kcu.constraint_name = rc.constraint_name
            AND kcu.table_schema = rc.constraint_schema
          JOIN information_schema.key_column_usage ccu 
            ON rc.unique_constraint_name = ccu.constraint_name
            AND rc.unique_constraint_schema = ccu.table_schema
          WHERE kcu.constraint_schema = 'public'
            AND kcu.table_name = $1
            AND kcu.constraint_name = $2
        `,
          [table_name, constraint_name],
        );

        if (fkResult.rows.length > 0) {
          const fk = fkResult.rows[0];
          const deleteRule = (fk.delete_rule || "RESTRICT")
            .toUpperCase()
            .replace(/ /g, " ");
          const updateRule = (fk.update_rule || "RESTRICT")
            .toUpperCase()
            .replace(/ /g, " ");
          sql += `ALTER TABLE ONLY "public"."${table_name}"\n`;
          sql += `  ADD CONSTRAINT "${constraint_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES ${fk.referenced_table}(${fk.referenced_column}) ON DELETE ${deleteRule} ON UPDATE ${updateRule};\n\n`;
        }
      }
    }

    // Get check constraints
    console.log("✔️  Fetching check constraints...");
    const allCheckResult = await client.query(`
      SELECT cc.constraint_name, cc.check_clause, tc.table_name
      FROM information_schema.check_constraints cc
      JOIN information_schema.table_constraints tc 
        ON cc.constraint_name = tc.constraint_name
        AND cc.constraint_schema = tc.table_schema
      WHERE cc.constraint_schema = 'public'
      ORDER BY tc.table_name, cc.constraint_name
    `);

    if (allCheckResult.rows.length > 0) {
      for (const check of allCheckResult.rows) {
        sql += `ALTER TABLE ONLY "public"."${check.table_name}"\n`;
        sql += `  ADD CONSTRAINT "${check.constraint_name}" CHECK ${check.check_clause};\n\n`;
      }
    }

    sql += `COMMIT;\n`;

    // Save to file
    const schemaPath = path.join(process.cwd(), "schema.sql");
    fs.writeFileSync(schemaPath, sql);

    console.log(`\n✨ Schema exported successfully to: ${schemaPath}`);
    console.log(`📊 Total tables: ${tables.length}`);
    console.log(`📝 Schema file size: ${(sql.length / 1024).toFixed(2)} KB`);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error exporting schema:", error.message);
    console.error("Error details:", error);
    await pool.end();
    process.exit(1);
  }
}

exportSchema();
