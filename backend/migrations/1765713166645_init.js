/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    -- =========================
    -- CORE TABLES
    -- =========================
    CREATE TABLE IF NOT EXISTS public.users (
      userid       BIGSERIAL PRIMARY KEY,
      tendangnhap  VARCHAR(255) NOT NULL,
      matkhau      VARCHAR(255) NOT NULL,
      email        VARCHAR(255) NOT NULL,
      sdt          VARCHAR(255) NOT NULL,
      hoten        VARCHAR(255) NOT NULL,
      avatarurl    VARCHAR(255),
      trangthai    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_users_tendangnhap UNIQUE (tendangnhap),
      CONSTRAINT uq_users_email UNIQUE (email),
      CONSTRAINT uq_users_sdt UNIQUE (sdt)
    );

    CREATE TABLE IF NOT EXISTS public.nhacungcap (
      nhacungcapid BIGSERIAL PRIMARY KEY,
      ten          VARCHAR(255) NOT NULL,
      tenviettat   VARCHAR(255) NOT NULL,
      email        VARCHAR(255) NOT NULL,
      sdt          VARCHAR(255) NOT NULL,
      logourl      VARCHAR(255),
      trangthai    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_ncc_tenviettat UNIQUE (tenviettat),
      CONSTRAINT uq_ncc_email UNIQUE (email)
    );

    CREATE TABLE IF NOT EXISTS public.danhmuc (
      danhmucid    BIGSERIAL PRIMARY KEY,
      ten          VARCHAR(255) NOT NULL,
      tenviettat   VARCHAR(255) NOT NULL,
      trangthai    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_danhmuc_tenviettat UNIQUE (tenviettat)
    );

    CREATE TABLE IF NOT EXISTS public.phuongthucthanhtoan (
      phuongthucid BIGSERIAL PRIMARY KEY,
      ten          VARCHAR(255) NOT NULL,
      CONSTRAINT uq_payment_name UNIQUE (ten)
    );

    CREATE TABLE IF NOT EXISTS public.thuoctinh (
      thuoctinhid  BIGSERIAL PRIMARY KEY,
      tenthuoctinh VARCHAR(255) NOT NULL,
      donvitinh    VARCHAR(255),
      kieudulieu   VARCHAR(255) NOT NULL,
      mota         TEXT
    );

    CREATE TABLE IF NOT EXISTS public.sanpham (
      sanphamid    BIGSERIAL PRIMARY KEY,
      danhmucid    BIGINT NOT NULL,
      nhacungcapid BIGINT NOT NULL,
      ten          VARCHAR(255) NOT NULL,
      motangan     TEXT NOT NULL,
      motachitiet  TEXT NOT NULL,
      tenviettat   VARCHAR(255) NOT NULL,
      hinhanhurl   VARCHAR(255),
      trangthai    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_sanpham_danhmuc FOREIGN KEY (danhmucid)
        REFERENCES public.danhmuc(danhmucid) ON DELETE RESTRICT,
      CONSTRAINT fk_sanpham_nhacungcap FOREIGN KEY (nhacungcapid)
        REFERENCES public.nhacungcap(nhacungcapid) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS ix_sanpham_danhmuc ON public.sanpham(danhmucid);
    CREATE INDEX IF NOT EXISTS ix_sanpham_nhacungcap ON public.sanpham(nhacungcapid);

    -- =========================
    -- VARIANT (TÊN ĐÚNG)
    -- =========================
    CREATE TABLE IF NOT EXISTS public.bienthe_sanpham (
      bentheid     BIGSERIAL PRIMARY KEY,
      sanphamid    BIGINT NOT NULL,
      sku          VARCHAR(100),
      giaban       NUMERIC(12,2) NOT NULL CHECK (giaban >= 0),
      tonkho       INT NOT NULL DEFAULT 0 CHECK (tonkho >= 0),
      hinhanhurl   VARCHAR(255),
      trangthai    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_bienthe_sanpham FOREIGN KEY (sanphamid)
        REFERENCES public.sanpham(sanphamid) ON DELETE RESTRICT,
      CONSTRAINT uq_bienthe_sku UNIQUE (sku)
    );

    CREATE INDEX IF NOT EXISTS ix_bienthe_sanpham ON public.bienthe_sanpham(sanphamid);

    -- VIEW tương thích tên cũ (để code cũ vẫn chạy):
    CREATE OR REPLACE VIEW public.bienthe_sampham AS
    SELECT * FROM public.bienthe_sanpham;

    -- =========================
    -- CATEGORY ATTRIBUTE
    -- =========================
    CREATE TABLE IF NOT EXISTS public.thuoctinhdanhmuc (
      dmttid       BIGSERIAL PRIMARY KEY,
      danhmucid    BIGINT NOT NULL,
      thuoctinhid  BIGINT NOT NULL,
      batbuoc      BOOLEAN NOT NULL DEFAULT FALSE,
      thutuhienthi INT NOT NULL DEFAULT 0 CHECK (thutuhienthi >= 0),
      CONSTRAINT fk_dmtt_danhmuc FOREIGN KEY (danhmucid)
        REFERENCES public.danhmuc(danhmucid) ON DELETE CASCADE,
      CONSTRAINT fk_dmtt_thuoctinh FOREIGN KEY (thuoctinhid)
        REFERENCES public.thuoctinh(thuoctinhid) ON DELETE RESTRICT,
      CONSTRAINT uq_dmtt UNIQUE (danhmucid, thuoctinhid)
    );
    CREATE INDEX IF NOT EXISTS ix_dmtt_thuoctinh ON public.thuoctinhdanhmuc(thuoctinhid);

    -- =========================
    -- VARIANT ATTRIBUTE VALUES
    -- =========================
    CREATE TABLE IF NOT EXISTS public.mang (
      bentheid    BIGINT NOT NULL,
      thuoctinhid BIGINT NOT NULL,
      giatri      TEXT NOT NULL,
      PRIMARY KEY (bentheid, thuoctinhid),
      CONSTRAINT fk_mang_bienthe FOREIGN KEY (bentheid)
        REFERENCES public.bienthe_sanpham(bentheid) ON DELETE CASCADE,
      CONSTRAINT fk_mang_thuoctinh FOREIGN KEY (thuoctinhid)
        REFERENCES public.thuoctinh(thuoctinhid) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS ix_mang_thuoctinh ON public.mang(thuoctinhid);

    -- =========================
    -- CART + ITEMS (1 user 1 cart)
    -- =========================
    CREATE TABLE IF NOT EXISTS public.giohang (
      magiohang  BIGSERIAL PRIMARY KEY,
      userid     BIGINT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_giohang_user FOREIGN KEY (userid)
        REFERENCES public.users(userid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS public.giohang_chua_bienthesanpham (
      magiohang BIGINT NOT NULL,
      bentheid  BIGINT NOT NULL,
      soluong   INT NOT NULL CHECK (soluong > 0),
      added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (magiohang, bentheid),
      CONSTRAINT fk_cartitem_cart FOREIGN KEY (magiohang)
        REFERENCES public.giohang(magiohang) ON DELETE CASCADE,
      CONSTRAINT fk_cartitem_variant FOREIGN KEY (bentheid)
        REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS ix_cartitem_variant ON public.giohang_chua_bienthesanpham(bentheid);

    -- =========================
    -- WISHLIST + ITEMS (1 user 1 wishlist)
    -- =========================
    CREATE TABLE IF NOT EXISTS public.danhsachyeuthich (
      danhsachyeuthichid BIGSERIAL PRIMARY KEY,
      userid             BIGINT NOT NULL UNIQUE,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_wishlist_user FOREIGN KEY (userid)
        REFERENCES public.users(userid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS public.bao_gom (
      danhsachyeuthichid BIGINT NOT NULL,
      bentheid           BIGINT NOT NULL,
      added_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (danhsachyeuthichid, bentheid),
      CONSTRAINT fk_baogom_wishlist FOREIGN KEY (danhsachyeuthichid)
        REFERENCES public.danhsachyeuthich(danhsachyeuthichid) ON DELETE CASCADE,
      CONSTRAINT fk_baogom_variant FOREIGN KEY (bentheid)
        REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS ix_baogom_variant ON public.bao_gom(bentheid);

    -- =========================
    -- ADDRESS (TÊN ĐÚNG) + VIEW tương thích tên cũ
    -- =========================
    CREATE TABLE IF NOT EXISTS public.user_address (
      diachiuserid  BIGSERIAL PRIMARY KEY,
      userid        BIGINT NOT NULL,
      tennguoinhan  VARCHAR(255) NOT NULL,
      sdtnguoinhan  VARCHAR(15) NOT NULL,
      tinhthanh     VARCHAR(255) NOT NULL,
      quanhuyen     VARCHAR(255) NOT NULL,
      phuongxa      VARCHAR(255) NOT NULL,
      diachichitiet TEXT NOT NULL,
      loaidiachi    VARCHAR(30) NOT NULL,
      macdinh       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_address_user FOREIGN KEY (userid)
        REFERENCES public.users(userid) ON DELETE CASCADE,
      CONSTRAINT uq_address_user_pair UNIQUE (userid, diachiuserid)
    );
    CREATE INDEX IF NOT EXISTS ix_address_user ON public.user_address(userid);

    CREATE UNIQUE INDEX IF NOT EXISTS ux_address_default_per_user
    ON public.user_address(userid)
    WHERE macdinh = TRUE;

    -- VIEW tương thích tên cũ:
    CREATE OR REPLACE VIEW public.uer_address AS
    SELECT * FROM public.user_address;

    -- =========================
    -- ORDER + ITEMS
    -- =========================
    CREATE TABLE IF NOT EXISTS public.donhang (
      donhangid     BIGSERIAL PRIMARY KEY,
      phuongthucid  BIGINT NOT NULL,
      userid        BIGINT NOT NULL,
      diachiuserid  BIGINT NOT NULL,
      tongtien      NUMERIC(12,2) NOT NULL CHECK (tongtien >= 0),
      phivanchuyen  NUMERIC(12,2) NOT NULL CHECK (phivanchuyen >= 0),
      tongthanhtoan NUMERIC(12,2) NOT NULL CHECK (tongthanhtoan >= 0),
      trangthai     TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (trangthai IN ('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED')),
      ghichu        VARCHAR(200),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT fk_order_payment FOREIGN KEY (phuongthucid)
        REFERENCES public.phuongthucthanhtoan(phuongthucid) ON DELETE RESTRICT,

      CONSTRAINT fk_order_user FOREIGN KEY (userid)
        REFERENCES public.users(userid) ON DELETE RESTRICT,

      -- đúng chủ: (userid, diachiuserid) phải thuộc cùng user
      CONSTRAINT fk_order_user_address FOREIGN KEY (userid, diachiuserid)
        REFERENCES public.user_address(userid, diachiuserid) ON DELETE RESTRICT,

      CONSTRAINT ck_order_total CHECK (tongthanhtoan = tongtien + phivanchuyen)
    );
    CREATE INDEX IF NOT EXISTS ix_donhang_user ON public.donhang(userid);
    CREATE INDEX IF NOT EXISTS ix_donhang_created ON public.donhang(created_at);

    CREATE TABLE IF NOT EXISTS public.ordor_gom (
      donhangid BIGINT NOT NULL,
      bentheid  BIGINT NOT NULL,
      soluong   INT NOT NULL CHECK (soluong > 0),
      dongia    NUMERIC(12,2) NOT NULL CHECK (dongia >= 0),
      PRIMARY KEY (donhangid, bentheid),
      CONSTRAINT fk_orderitem_order FOREIGN KEY (donhangid)
        REFERENCES public.donhang(donhangid) ON DELETE CASCADE,
      CONSTRAINT fk_orderitem_variant FOREIGN KEY (bentheid)
        REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS ix_orderitem_variant ON public.ordor_gom(bentheid);

    -- =========================
    -- REVIEW + POST
    -- =========================
    CREATE TABLE IF NOT EXISTS public.danhgia (
      danhgiaid  BIGSERIAL PRIMARY KEY,
      bentheid   BIGINT NOT NULL,
      userid     BIGINT NOT NULL,
      sosao      INT NOT NULL CHECK (sosao BETWEEN 1 AND 5),
      tieude     TEXT,
      noidung    TEXT,
      trangthai  BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_review_variant FOREIGN KEY (bentheid)
        REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT,
      CONSTRAINT fk_review_user FOREIGN KEY (userid)
        REFERENCES public.users(userid) ON DELETE RESTRICT,
      CONSTRAINT uq_review_once UNIQUE (userid, bentheid)
    );
    CREATE INDEX IF NOT EXISTS ix_review_variant ON public.danhgia(bentheid);

    CREATE TABLE IF NOT EXISTS public.baidang (
      baidangid   BIGSERIAL PRIMARY KEY,
      userid      BIGINT NOT NULL,
      tieude      TEXT NOT NULL,
      tomtat      TEXT NOT NULL,
      noidung     TEXT NOT NULL,
      hinhanhurl  VARCHAR(255),
      loaibaidang TEXT NOT NULL,
      trangthai   BOOLEAN NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_post_user FOREIGN KEY (userid)
        REFERENCES public.users(userid) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS ix_baidang_user ON public.baidang(userid);

    -- =========================
    -- PROMOTION (APPLY TO PRODUCTS)
    -- =========================
    CREATE TABLE IF NOT EXISTS public.chuongtrinhkhuyenmai (
      khuyenmaiid      BIGSERIAL PRIMARY KEY,
      tenkhuyenmai     TEXT NOT NULL,
      mota             TEXT,
      loaigiamgia      TEXT NOT NULL CHECK (loaigiamgia IN ('FIXED','PERCENT')),
      giatrigiamcodinh NUMERIC(12,2) CHECK (giatrigiamcodinh IS NULL OR giatrigiamcodinh >= 0),
      tylegiam         NUMERIC(5,2)  CHECK (tylegiam IS NULL OR (tylegiam > 0 AND tylegiam <= 100)),
      thoigianbatdau   TIMESTAMPTZ NOT NULL,
      thoigianketthuc  TIMESTAMPTZ NOT NULL,
      trangthai        BOOLEAN NOT NULL DEFAULT TRUE,
      cothecongdon     BOOLEAN NOT NULL DEFAULT FALSE,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT ck_km_time CHECK (thoigianketthuc > thoigianbatdau),
      CONSTRAINT ck_km_mode CHECK (
        (loaigiamgia = 'FIXED'   AND giatrigiamcodinh IS NOT NULL AND tylegiam IS NULL)
        OR
        (loaigiamgia = 'PERCENT' AND tylegiam IS NOT NULL AND giatrigiamcodinh IS NULL)
      )
    );

    CREATE TABLE IF NOT EXISTS public.khuyenmai_ap_dung_sanpham (
      khuyenmaiid BIGINT NOT NULL,
      sanphamid   BIGINT NOT NULL,
      PRIMARY KEY (khuyenmaiid, sanphamid),
      CONSTRAINT fk_km_sp_km FOREIGN KEY (khuyenmaiid)
        REFERENCES public.chuongtrinhkhuyenmai(khuyenmaiid) ON DELETE CASCADE,
      CONSTRAINT fk_km_sp_sp FOREIGN KEY (sanphamid)
        REFERENCES public.sanpham(sanphamid) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS ix_km_sp_sanpham ON public.khuyenmai_ap_dung_sanpham(sanphamid);

    -- =========================
    -- COUPON + APPLY TO VARIANTS + REDEEM HISTORY
    -- =========================
    CREATE TABLE IF NOT EXISTS public.magiamgia (
      magiamgiaid           BIGSERIAL PRIMARY KEY,
      code                  VARCHAR(50) NOT NULL,
      tenma                 TEXT,
      loaigiamgia           TEXT NOT NULL CHECK (loaigiamgia IN ('FIXED','PERCENT')),
      giatrigiamcodinh      NUMERIC(12,2) CHECK (giatrigiamcodinh IS NULL OR giatrigiamcodinh >= 0),
      tylegiam              NUMERIC(5,2)  CHECK (tylegiam IS NULL OR (tylegiam > 0 AND tylegiam <= 100)),
      thoigianbatdau        TIMESTAMPTZ NOT NULL,
      thoigianketthuc       TIMESTAMPTZ NOT NULL,
      soluongtoida          INT NOT NULL CHECK (soluongtoida >= 0),
      soluongdadung         INT NOT NULL DEFAULT 0 CHECK (soluongdadung >= 0),
      gioihanmoiuser        INT NOT NULL DEFAULT 1 CHECK (gioihanmoiuser >= 1),
      giatridonhangtoithieu NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (giatridonhangtoithieu >= 0),
      giamtoida             NUMERIC(12,2) CHECK (giamtoida IS NULL OR giamtoida >= 0),
      trangthai             BOOLEAN NOT NULL DEFAULT TRUE,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_magiamgia_code UNIQUE (code),
      CONSTRAINT ck_coupon_time CHECK (thoigianketthuc > thoigianbatdau),
      CONSTRAINT ck_coupon_mode CHECK (
        (loaigiamgia = 'FIXED'   AND giatrigiamcodinh IS NOT NULL AND tylegiam IS NULL)
        OR
        (loaigiamgia = 'PERCENT' AND tylegiam IS NOT NULL AND giatrigiamcodinh IS NULL)
      ),
      CONSTRAINT ck_coupon_used_le_total CHECK (soluongdadung <= soluongtoida)
    );

    CREATE TABLE IF NOT EXISTS public.dung_cho (
      bentheid    BIGINT NOT NULL,
      magiamgiaid BIGINT NOT NULL,
      PRIMARY KEY (bentheid, magiamgiaid),
      CONSTRAINT fk_dungcho_variant FOREIGN KEY (bentheid)
        REFERENCES public.bienthe_sanpham(bentheid) ON DELETE CASCADE,
      CONSTRAINT fk_dungcho_coupon FOREIGN KEY (magiamgiaid)
        REFERENCES public.magiamgia(magiamgiaid) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS ix_dungcho_coupon ON public.dung_cho(magiamgiaid);

    -- hỗ trợ FK kép "đúng chủ" cho nhap_ma
    CREATE UNIQUE INDEX IF NOT EXISTS ux_donhang_id_user
    ON public.donhang(donhangid, userid);

    CREATE TABLE IF NOT EXISTS public.nhap_ma (
      nhapmaid         BIGSERIAL PRIMARY KEY,
      userid           BIGINT NOT NULL,
      magiamgiaid      BIGINT NOT NULL,
      bentheid         BIGINT NOT NULL,
      donhangid        BIGINT NOT NULL,
      thoidiem         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sotiengiamthucte NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (sotiengiamthucte >= 0),
      trangthai        TEXT NOT NULL DEFAULT 'APPLIED'
        CHECK (trangthai IN ('APPLIED','CANCELLED','REFUNDED')),

      CONSTRAINT fk_nhapma_user FOREIGN KEY (userid)
        REFERENCES public.users(userid) ON DELETE RESTRICT,
      CONSTRAINT fk_nhapma_coupon FOREIGN KEY (magiamgiaid)
        REFERENCES public.magiamgia(magiamgiaid) ON DELETE RESTRICT,
      CONSTRAINT fk_nhapma_variant FOREIGN KEY (bentheid)
        REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT,

      -- đúng chủ: userid trong nhap_ma phải đúng userid của donhang
      CONSTRAINT fk_nhapma_order_owner FOREIGN KEY (donhangid, userid)
        REFERENCES public.donhang(donhangid, userid) ON DELETE RESTRICT,

      -- chặn nhập lại: user + coupon + variant chỉ 1 lần
      CONSTRAINT uq_nhapma_once UNIQUE (userid, magiamgiaid, bentheid),

      -- mã phải áp dụng được cho biến thể (FK kép)
      CONSTRAINT fk_nhapma_dungcho FOREIGN KEY (bentheid, magiamgiaid)
        REFERENCES public.dung_cho(bentheid, magiamgiaid) ON DELETE RESTRICT,

      -- đơn phải có chứa biến thể đó (FK kép)
      CONSTRAINT fk_nhapma_ordor_gom FOREIGN KEY (donhangid, bentheid)
        REFERENCES public.ordor_gom(donhangid, bentheid) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS ix_nhapma_user   ON public.nhap_ma(userid);
    CREATE INDEX IF NOT EXISTS ix_nhapma_coupon ON public.nhap_ma(magiamgiaid);
    CREATE INDEX IF NOT EXISTS ix_nhapma_variant ON public.nhap_ma(bentheid);

    -- =========================
    -- SAFE VIEW: user_profile (không lộ matkhau)
    -- =========================
    CREATE OR REPLACE VIEW public.user_profile AS
    SELECT
      u.userid,
      u.tendangnhap,
      u.email,
      u.sdt,
      u.hoten,
      u.avatarurl,
      u.trangthai,
      u.created_at,
      gh.magiohang,
      wl.danhsachyeuthichid
    FROM public.users u
    LEFT JOIN public.giohang gh ON gh.userid = u.userid
    LEFT JOIN public.danhsachyeuthich wl ON wl.userid = u.userid;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.sql(`
    -- drop views first
    DROP VIEW IF EXISTS public.user_profile;
    DROP VIEW IF EXISTS public.bienthe_sampham;
    DROP VIEW IF EXISTS public.uer_address;

    -- drop tables (reverse-ish, cascade to be safe on a reset)
    DROP TABLE IF EXISTS public.nhap_ma CASCADE;
    DROP TABLE IF EXISTS public.dung_cho CASCADE;
    DROP TABLE IF EXISTS public.magiamgia CASCADE;

    DROP TABLE IF EXISTS public.khuyenmai_ap_dung_sanpham CASCADE;
    DROP TABLE IF EXISTS public.chuongtrinhkhuyenmai CASCADE;

    DROP TABLE IF EXISTS public.baidang CASCADE;
    DROP TABLE IF EXISTS public.danhgia CASCADE;

    DROP TABLE IF EXISTS public.ordor_gom CASCADE;
    DROP TABLE IF EXISTS public.donhang CASCADE;

    DROP TABLE IF EXISTS public.user_address CASCADE;

    DROP TABLE IF EXISTS public.bao_gom CASCADE;
    DROP TABLE IF EXISTS public.danhsachyeuthich CASCADE;

    DROP TABLE IF EXISTS public.giohang_chua_bienthesanpham CASCADE;
    DROP TABLE IF EXISTS public.giohang CASCADE;

    DROP TABLE IF EXISTS public.mang CASCADE;
    DROP TABLE IF EXISTS public.thuoctinhdanhmuc CASCADE;

    DROP TABLE IF EXISTS public.bienthe_sanpham CASCADE;
    DROP TABLE IF EXISTS public.sanpham CASCADE;

    DROP TABLE IF EXISTS public.thuoctinh CASCADE;
    DROP TABLE IF EXISTS public.phuongthucthanhtoan CASCADE;
    DROP TABLE IF EXISTS public.danhmuc CASCADE;
    DROP TABLE IF EXISTS public.nhacungcap CASCADE;
    DROP TABLE IF EXISTS public.users CASCADE;
  `);
};
