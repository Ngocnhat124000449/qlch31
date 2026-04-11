/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS public.user_profile (
      userid BIGINT NOT NULL PRIMARY KEY,
      bio TEXT,
      phone_verified BOOLEAN DEFAULT false,
      email_verified BOOLEAN DEFAULT false,
      two_factor_enabled BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      CONSTRAINT fk_profile_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE
    );
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS public.user_profile CASCADE;
  `);
};
