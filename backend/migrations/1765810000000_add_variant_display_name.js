/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE public.bienthe_sanpham
    ADD COLUMN IF NOT EXISTS tenbienthe VARCHAR(255);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE public.bienthe_sanpham
    DROP COLUMN IF EXISTS tenbienthe;
  `);
};
