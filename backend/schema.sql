-- Schema exported from Neon database
-- Generated at: 2026-04-10T10:49:25.788Z

BEGIN;

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS "public"."baidang" (
  "baidangid" BIGINT(64) DEFAULT nextval('baidang_baidangid_seq'::regclass) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "tieude" TEXT NOT NULL,
  "tomtat" TEXT NOT NULL,
  "noidung" TEXT NOT NULL,
  "hinhanhurl" CHARACTER VARYING(255),
  "loaibaidang" TEXT NOT NULL,
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."banner" (
  "bannerid" BIGINT(64) DEFAULT nextval('banner_bannerid_seq'::regclass) NOT NULL,
  "ten" CHARACTER VARYING(255) NOT NULL,
  "mota" TEXT,
  "imageurl" TEXT NOT NULL,
  "linkurl" TEXT,
  "vitri" CHARACTER VARYING(50) DEFAULT 'HOME_TOP'::character varying NOT NULL,
  "thutuhienthi" INTEGER(32) DEFAULT 0 NOT NULL,
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "thoigianbatdau" TIMESTAMP WITH TIME ZONE,
  "thoigianketthuc" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."bao_gom" (
  "danhsachyeuthichid" BIGINT(64) NOT NULL,
  "bentheid" BIGINT(64) NOT NULL,
  "added_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."bienthe_sanpham" (
  "bentheid" BIGINT(64) DEFAULT nextval('bienthe_sanpham_bentheid_seq'::regclass) NOT NULL,
  "sanphamid" BIGINT(64) NOT NULL,
  "sku" CHARACTER VARYING(100),
  "giaban" NUMERIC(12,2) NOT NULL,
  "tonkho" INTEGER(32) DEFAULT 0 NOT NULL,
  "hinhanhurl" CHARACTER VARYING(255),
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "tenbienthe" CHARACTER VARYING(255)
);

CREATE TABLE IF NOT EXISTS "public"."chuongtrinhkhuyenmai" (
  "khuyenmaiid" BIGINT(64) DEFAULT nextval('chuongtrinhkhuyenmai_khuyenmaiid_seq'::regclass) NOT NULL,
  "tenkhuyenmai" TEXT NOT NULL,
  "mota" TEXT,
  "loaigiamgia" TEXT NOT NULL,
  "giatrigiamcodinh" NUMERIC(12,2),
  "tylegiam" NUMERIC(5,2),
  "thoigianbatdau" TIMESTAMP WITH TIME ZONE NOT NULL,
  "thoigianketthuc" TIMESTAMP WITH TIME ZONE NOT NULL,
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "cothecongdon" BOOLEAN DEFAULT false NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."danhgia" (
  "danhgiaid" BIGINT(64) DEFAULT nextval('danhgia_danhgiaid_seq'::regclass) NOT NULL,
  "bentheid" BIGINT(64) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "sosao" INTEGER(32) NOT NULL,
  "tieude" TEXT,
  "noidung" TEXT,
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."danhmuc" (
  "danhmucid" BIGINT(64) DEFAULT nextval('danhmuc_danhmucid_seq'::regclass) NOT NULL,
  "ten" CHARACTER VARYING(255) NOT NULL,
  "tenviettat" CHARACTER VARYING(255) NOT NULL,
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."danhsachyeuthich" (
  "danhsachyeuthichid" BIGINT(64) DEFAULT nextval('danhsachyeuthich_danhsachyeuthichid_seq'::regclass) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."donhang" (
  "donhangid" BIGINT(64) DEFAULT nextval('donhang_donhangid_seq'::regclass) NOT NULL,
  "phuongthucid" BIGINT(64) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "diachiuserid" BIGINT(64) NOT NULL,
  "tongtien" NUMERIC(12,2) NOT NULL,
  "phivanchuyen" NUMERIC(12,2) NOT NULL,
  "tongthanhtoan" NUMERIC(12,2) NOT NULL,
  "trangthai" TEXT DEFAULT 'PENDING'::text NOT NULL,
  "ghichu" CHARACTER VARYING(200),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."dung_cho" (
  "bentheid" BIGINT(64) NOT NULL,
  "magiamgiaid" BIGINT(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."giohang" (
  "magiohang" BIGINT(64) DEFAULT nextval('giohang_magiohang_seq'::regclass) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."giohang_chua_bienthesanpham" (
  "magiohang" BIGINT(64) NOT NULL,
  "bentheid" BIGINT(64) NOT NULL,
  "soluong" INTEGER(32) NOT NULL,
  "added_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."khuyenmai_ap_dung_sanpham" (
  "khuyenmaiid" BIGINT(64) NOT NULL,
  "sanphamid" BIGINT(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."magiamgia" (
  "magiamgiaid" BIGINT(64) DEFAULT nextval('magiamgia_magiamgiaid_seq'::regclass) NOT NULL,
  "code" CHARACTER VARYING(50) NOT NULL,
  "tenma" TEXT,
  "loaigiamgia" TEXT NOT NULL,
  "giatrigiamcodinh" NUMERIC(12,2),
  "tylegiam" NUMERIC(5,2),
  "thoigianbatdau" TIMESTAMP WITH TIME ZONE NOT NULL,
  "thoigianketthuc" TIMESTAMP WITH TIME ZONE NOT NULL,
  "soluongtoida" INTEGER(32) NOT NULL,
  "soluongdadung" INTEGER(32) DEFAULT 0 NOT NULL,
  "gioihanmoiuser" INTEGER(32) DEFAULT 1 NOT NULL,
  "giatridonhangtoithieu" NUMERIC(12,2) DEFAULT 0 NOT NULL,
  "giamtoida" NUMERIC(12,2),
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."mang" (
  "bentheid" BIGINT(64) NOT NULL,
  "thuoctinhid" BIGINT(64) NOT NULL,
  "giatri" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."nhacungcap" (
  "nhacungcapid" BIGINT(64) DEFAULT nextval('nhacungcap_nhacungcapid_seq'::regclass) NOT NULL,
  "ten" CHARACTER VARYING(255) NOT NULL,
  "tenviettat" CHARACTER VARYING(255) NOT NULL,
  "email" CHARACTER VARYING(255) NOT NULL,
  "sdt" CHARACTER VARYING(255) NOT NULL,
  "logourl" CHARACTER VARYING(255),
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."nhap_ma" (
  "nhapmaid" BIGINT(64) DEFAULT nextval('nhap_ma_nhapmaid_seq'::regclass) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "magiamgiaid" BIGINT(64) NOT NULL,
  "bentheid" BIGINT(64) NOT NULL,
  "donhangid" BIGINT(64) NOT NULL,
  "thoidiem" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "sotiengiamthucte" NUMERIC(12,2) DEFAULT 0 NOT NULL,
  "trangthai" TEXT DEFAULT 'APPLIED'::text NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."ordor_gom" (
  "donhangid" BIGINT(64) NOT NULL,
  "bentheid" BIGINT(64) NOT NULL,
  "soluong" INTEGER(32) NOT NULL,
  "dongia" NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."pgmigrations" (
  "id" INTEGER(32) DEFAULT nextval('pgmigrations_id_seq'::regclass) NOT NULL,
  "name" CHARACTER VARYING(255) NOT NULL,
  "run_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."phien_dang_nhap" (
  "phienid" BIGINT(64) DEFAULT nextval('phien_dang_nhap_phienid_seq'::regclass) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "refresh_hash" TEXT NOT NULL,
  "revoked_at" TIMESTAMP WITH TIME ZONE,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."phuongthucthanhtoan" (
  "phuongthucid" BIGINT(64) DEFAULT nextval('phuongthucthanhtoan_phuongthucid_seq'::regclass) NOT NULL,
  "ten" CHARACTER VARYING(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."sanpham" (
  "sanphamid" BIGINT(64) DEFAULT nextval('sanpham_sanphamid_seq'::regclass) NOT NULL,
  "danhmucid" BIGINT(64) NOT NULL,
  "nhacungcapid" BIGINT(64) NOT NULL,
  "ten" CHARACTER VARYING(255) NOT NULL,
  "motangan" TEXT NOT NULL,
  "motachitiet" TEXT NOT NULL,
  "tenviettat" CHARACTER VARYING(255) NOT NULL,
  "hinhanhurl" CHARACTER VARYING(255),
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."thuoctinh" (
  "thuoctinhid" BIGINT(64) DEFAULT nextval('thuoctinh_thuoctinhid_seq'::regclass) NOT NULL,
  "tenthuoctinh" CHARACTER VARYING(255) NOT NULL,
  "donvitinh" CHARACTER VARYING(255),
  "kieudulieu" CHARACTER VARYING(255) NOT NULL,
  "mota" TEXT
);

CREATE TABLE IF NOT EXISTS "public"."thuoctinhdanhmuc" (
  "dmttid" BIGINT(64) DEFAULT nextval('thuoctinhdanhmuc_dmttid_seq'::regclass) NOT NULL,
  "danhmucid" BIGINT(64) NOT NULL,
  "thuoctinhid" BIGINT(64) NOT NULL,
  "batbuoc" BOOLEAN DEFAULT false NOT NULL,
  "thutuhienthi" INTEGER(32) DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_address" (
  "diachiuserid" BIGINT(64) DEFAULT nextval('user_address_diachiuserid_seq'::regclass) NOT NULL,
  "userid" BIGINT(64) NOT NULL,
  "tennguoinhan" CHARACTER VARYING(255) NOT NULL,
  "sdtnguoinhan" CHARACTER VARYING(15) NOT NULL,
  "tinhthanh" CHARACTER VARYING(255) NOT NULL,
  "quanhuyen" CHARACTER VARYING(255) NOT NULL,
  "phuongxa" CHARACTER VARYING(255) NOT NULL,
  "diachichitiet" TEXT NOT NULL,
  "loaidiachi" CHARACTER VARYING(30) NOT NULL,
  "macdinh" BOOLEAN DEFAULT false NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."users" (
  "userid" BIGINT(64) DEFAULT nextval('users_userid_seq'::regclass) NOT NULL,
  "tendangnhap" CHARACTER VARYING(255) NOT NULL,
  "matkhau" CHARACTER VARYING(255) NOT NULL,
  "email" CHARACTER VARYING(255) NOT NULL,
  "sdt" CHARACTER VARYING(255) NOT NULL,
  "hoten" CHARACTER VARYING(255) NOT NULL,
  "avatarurl" CHARACTER VARYING(255),
  "trangthai" BOOLEAN DEFAULT true NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "role" CHARACTER VARYING(20) DEFAULT 'user'::character varying NOT NULL
);

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "fk_post_user" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "baidang_pkey" PRIMARY KEY ("baidangid");

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "banner_pkey" PRIMARY KEY ("bannerid");

ALTER TABLE ONLY "public"."bao_gom"
  ADD CONSTRAINT "fk_baogom_wishlist" FOREIGN KEY ("danhsachyeuthichid") REFERENCES danhsachyeuthich(danhsachyeuthichid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."bao_gom"
  ADD CONSTRAINT "fk_baogom_variant" FOREIGN KEY ("bentheid") REFERENCES bienthe_sanpham(bentheid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."bao_gom"
  ADD CONSTRAINT "bao_gom_pkey" PRIMARY KEY ("danhsachyeuthichid", "bentheid");

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "fk_bienthe_sanpham" FOREIGN KEY ("sanphamid") REFERENCES sanpham(sanphamid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "bienthe_sanpham_pkey" PRIMARY KEY ("bentheid");

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "uq_bienthe_sku" UNIQUE ("sku");

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "chuongtrinhkhuyenmai_pkey" PRIMARY KEY ("khuyenmaiid");

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "fk_review_variant" FOREIGN KEY ("bentheid") REFERENCES bienthe_sanpham(bentheid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "fk_review_user" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "danhgia_pkey" PRIMARY KEY ("danhgiaid");

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "uq_review_once" UNIQUE ("userid", "bentheid");

ALTER TABLE ONLY "public"."danhmuc"
  ADD CONSTRAINT "danhmuc_pkey" PRIMARY KEY ("danhmucid");

ALTER TABLE ONLY "public"."danhmuc"
  ADD CONSTRAINT "uq_danhmuc_tenviettat" UNIQUE ("tenviettat");

ALTER TABLE ONLY "public"."danhsachyeuthich"
  ADD CONSTRAINT "fk_wishlist_user" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."danhsachyeuthich"
  ADD CONSTRAINT "danhsachyeuthich_pkey" PRIMARY KEY ("danhsachyeuthichid");

ALTER TABLE ONLY "public"."danhsachyeuthich"
  ADD CONSTRAINT "danhsachyeuthich_userid_key" UNIQUE ("userid");

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "fk_order_user_address" FOREIGN KEY ("userid") REFERENCES user_address(userid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "fk_order_payment" FOREIGN KEY ("phuongthucid") REFERENCES phuongthucthanhtoan(phuongthucid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "fk_order_user" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "donhang_pkey" PRIMARY KEY ("donhangid");

ALTER TABLE ONLY "public"."dung_cho"
  ADD CONSTRAINT "fk_dungcho_variant" FOREIGN KEY ("bentheid") REFERENCES bienthe_sanpham(bentheid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."dung_cho"
  ADD CONSTRAINT "fk_dungcho_coupon" FOREIGN KEY ("magiamgiaid") REFERENCES magiamgia(magiamgiaid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."dung_cho"
  ADD CONSTRAINT "dung_cho_pkey" PRIMARY KEY ("bentheid", "magiamgiaid");

ALTER TABLE ONLY "public"."giohang"
  ADD CONSTRAINT "fk_giohang_user" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."giohang"
  ADD CONSTRAINT "giohang_pkey" PRIMARY KEY ("magiohang");

ALTER TABLE ONLY "public"."giohang"
  ADD CONSTRAINT "giohang_userid_key" UNIQUE ("userid");

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "fk_cartitem_variant" FOREIGN KEY ("bentheid") REFERENCES bienthe_sanpham(bentheid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "fk_cartitem_cart" FOREIGN KEY ("magiohang") REFERENCES giohang(magiohang) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "giohang_chua_bienthesanpham_pkey" PRIMARY KEY ("magiohang", "bentheid");

ALTER TABLE ONLY "public"."khuyenmai_ap_dung_sanpham"
  ADD CONSTRAINT "fk_km_sp_sp" FOREIGN KEY ("sanphamid") REFERENCES sanpham(sanphamid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."khuyenmai_ap_dung_sanpham"
  ADD CONSTRAINT "fk_km_sp_km" FOREIGN KEY ("khuyenmaiid") REFERENCES chuongtrinhkhuyenmai(khuyenmaiid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."khuyenmai_ap_dung_sanpham"
  ADD CONSTRAINT "khuyenmai_ap_dung_sanpham_pkey" PRIMARY KEY ("khuyenmaiid", "sanphamid");

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_pkey" PRIMARY KEY ("magiamgiaid");

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "uq_magiamgia_code" UNIQUE ("code");

ALTER TABLE ONLY "public"."mang"
  ADD CONSTRAINT "fk_mang_thuoctinh" FOREIGN KEY ("thuoctinhid") REFERENCES thuoctinh(thuoctinhid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."mang"
  ADD CONSTRAINT "fk_mang_bienthe" FOREIGN KEY ("bentheid") REFERENCES bienthe_sanpham(bentheid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."mang"
  ADD CONSTRAINT "mang_pkey" PRIMARY KEY ("bentheid", "thuoctinhid");

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "nhacungcap_pkey" PRIMARY KEY ("nhacungcapid");

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "uq_ncc_tenviettat" UNIQUE ("tenviettat");

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "uq_ncc_email" UNIQUE ("email");

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "fk_nhapma_coupon" FOREIGN KEY ("magiamgiaid") REFERENCES magiamgia(magiamgiaid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "fk_nhapma_user" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "fk_nhapma_dungcho" FOREIGN KEY ("bentheid") REFERENCES dung_cho(bentheid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "fk_nhapma_ordor_gom" FOREIGN KEY ("donhangid") REFERENCES ordor_gom(donhangid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "fk_nhapma_variant" FOREIGN KEY ("bentheid") REFERENCES bienthe_sanpham(bentheid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "nhap_ma_pkey" PRIMARY KEY ("nhapmaid");

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "uq_nhapma_once" UNIQUE ("userid", "magiamgiaid", "bentheid");

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "fk_orderitem_order" FOREIGN KEY ("donhangid") REFERENCES donhang(donhangid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "fk_orderitem_variant" FOREIGN KEY ("bentheid") REFERENCES bienthe_sanpham(bentheid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "ordor_gom_pkey" PRIMARY KEY ("donhangid", "bentheid");

ALTER TABLE ONLY "public"."pgmigrations"
  ADD CONSTRAINT "pgmigrations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "phien_dang_nhap_userid_fkey" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "phien_dang_nhap_pkey" PRIMARY KEY ("phienid");

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "phien_dang_nhap_refresh_hash_key" UNIQUE ("refresh_hash");

ALTER TABLE ONLY "public"."phuongthucthanhtoan"
  ADD CONSTRAINT "phuongthucthanhtoan_pkey" PRIMARY KEY ("phuongthucid");

ALTER TABLE ONLY "public"."phuongthucthanhtoan"
  ADD CONSTRAINT "uq_payment_name" UNIQUE ("ten");

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "fk_sanpham_nhacungcap" FOREIGN KEY ("nhacungcapid") REFERENCES nhacungcap(nhacungcapid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "fk_sanpham_danhmuc" FOREIGN KEY ("danhmucid") REFERENCES danhmuc(danhmucid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "sanpham_pkey" PRIMARY KEY ("sanphamid");

ALTER TABLE ONLY "public"."thuoctinh"
  ADD CONSTRAINT "thuoctinh_pkey" PRIMARY KEY ("thuoctinhid");

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "fk_dmtt_thuoctinh" FOREIGN KEY ("thuoctinhid") REFERENCES thuoctinh(thuoctinhid) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "fk_dmtt_danhmuc" FOREIGN KEY ("danhmucid") REFERENCES danhmuc(danhmucid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "thuoctinhdanhmuc_pkey" PRIMARY KEY ("dmttid");

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "uq_dmtt" UNIQUE ("danhmucid", "thuoctinhid");

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "fk_address_user" FOREIGN KEY ("userid") REFERENCES users(userid) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "user_address_pkey" PRIMARY KEY ("diachiuserid");

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "uq_address_user_pair" UNIQUE ("userid", "diachiuserid");

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "users_pkey" PRIMARY KEY ("userid");

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "uq_users_email" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "uq_users_sdt" UNIQUE ("sdt");

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "uq_users_tendangnhap" UNIQUE ("tendangnhap");

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_1_not_null" CHECK baidangid IS NOT NULL;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_2_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_3_not_null" CHECK tieude IS NOT NULL;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_4_not_null" CHECK tomtat IS NOT NULL;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_5_not_null" CHECK noidung IS NOT NULL;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_7_not_null" CHECK loaibaidang IS NOT NULL;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_8_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."baidang"
  ADD CONSTRAINT "2200_24900_9_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_11_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_12_not_null" CHECK updated_at IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_1_not_null" CHECK bannerid IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_2_not_null" CHECK ten IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_4_not_null" CHECK imageurl IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_6_not_null" CHECK vitri IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_7_not_null" CHECK thutuhienthi IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "2200_49153_8_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "banner_thutuhienthi_check" CHECK (thutuhienthi >= 0);

ALTER TABLE ONLY "public"."banner"
  ADD CONSTRAINT "ck_banner_time" CHECK ((thoigianketthuc IS NULL) OR (thoigianbatdau IS NULL) OR (thoigianketthuc > thoigianbatdau));

ALTER TABLE ONLY "public"."bao_gom"
  ADD CONSTRAINT "2200_24782_1_not_null" CHECK danhsachyeuthichid IS NOT NULL;

ALTER TABLE ONLY "public"."bao_gom"
  ADD CONSTRAINT "2200_24782_2_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."bao_gom"
  ADD CONSTRAINT "2200_24782_3_not_null" CHECK added_at IS NOT NULL;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "2200_24670_1_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "2200_24670_2_not_null" CHECK sanphamid IS NOT NULL;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "2200_24670_4_not_null" CHECK giaban IS NOT NULL;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "2200_24670_5_not_null" CHECK tonkho IS NOT NULL;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "2200_24670_7_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "2200_24670_8_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "bienthe_sanpham_giaban_check" CHECK (giaban >= (0)::numeric);

ALTER TABLE ONLY "public"."bienthe_sanpham"
  ADD CONSTRAINT "bienthe_sanpham_tonkho_check" CHECK (tonkho >= 0);

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_10_not_null" CHECK cothecongdon IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_11_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_1_not_null" CHECK khuyenmaiid IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_2_not_null" CHECK tenkhuyenmai IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_4_not_null" CHECK loaigiamgia IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_7_not_null" CHECK thoigianbatdau IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_8_not_null" CHECK thoigianketthuc IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "2200_24917_9_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "chuongtrinhkhuyenmai_giatrigiamcodinh_check" CHECK ((giatrigiamcodinh IS NULL) OR (giatrigiamcodinh >= (0)::numeric));

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "chuongtrinhkhuyenmai_loaigiamgia_check" CHECK (loaigiamgia = ANY (ARRAY['FIXED'::text, 'PERCENT'::text]));

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "chuongtrinhkhuyenmai_tylegiam_check" CHECK ((tylegiam IS NULL) OR ((tylegiam > (0)::numeric) AND (tylegiam <= (100)::numeric)));

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "ck_km_mode" CHECK (((loaigiamgia = 'FIXED'::text) AND (giatrigiamcodinh IS NOT NULL) AND (tylegiam IS NULL)) OR ((loaigiamgia = 'PERCENT'::text) AND (tylegiam IS NOT NULL) AND (giatrigiamcodinh IS NULL)));

ALTER TABLE ONLY "public"."chuongtrinhkhuyenmai"
  ADD CONSTRAINT "ck_km_time" CHECK (thoigianketthuc > thoigianbatdau);

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "2200_24875_1_not_null" CHECK danhgiaid IS NOT NULL;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "2200_24875_2_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "2200_24875_3_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "2200_24875_4_not_null" CHECK sosao IS NOT NULL;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "2200_24875_7_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "2200_24875_8_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."danhgia"
  ADD CONSTRAINT "danhgia_sosao_check" CHECK ((sosao >= 1) AND (sosao <= 5));

ALTER TABLE ONLY "public"."danhmuc"
  ADD CONSTRAINT "2200_24616_1_not_null" CHECK danhmucid IS NOT NULL;

ALTER TABLE ONLY "public"."danhmuc"
  ADD CONSTRAINT "2200_24616_2_not_null" CHECK ten IS NOT NULL;

ALTER TABLE ONLY "public"."danhmuc"
  ADD CONSTRAINT "2200_24616_3_not_null" CHECK tenviettat IS NOT NULL;

ALTER TABLE ONLY "public"."danhmuc"
  ADD CONSTRAINT "2200_24616_4_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."danhmuc"
  ADD CONSTRAINT "2200_24616_5_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."danhsachyeuthich"
  ADD CONSTRAINT "2200_24768_1_not_null" CHECK danhsachyeuthichid IS NOT NULL;

ALTER TABLE ONLY "public"."danhsachyeuthich"
  ADD CONSTRAINT "2200_24768_2_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."danhsachyeuthich"
  ADD CONSTRAINT "2200_24768_3_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_10_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_1_not_null" CHECK donhangid IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_2_not_null" CHECK phuongthucid IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_3_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_4_not_null" CHECK diachiuserid IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_5_not_null" CHECK tongtien IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_6_not_null" CHECK phivanchuyen IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_7_not_null" CHECK tongthanhtoan IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "2200_24824_8_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "ck_order_total" CHECK (tongthanhtoan = (tongtien + phivanchuyen));

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "donhang_phivanchuyen_check" CHECK (phivanchuyen >= (0)::numeric);

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "donhang_tongthanhtoan_check" CHECK (tongthanhtoan >= (0)::numeric);

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "donhang_tongtien_check" CHECK (tongtien >= (0)::numeric);

ALTER TABLE ONLY "public"."donhang"
  ADD CONSTRAINT "donhang_trangthai_check" CHECK (trangthai = ANY (ARRAY['PENDING'::text, 'PAID'::text, 'SHIPPED'::text, 'COMPLETED'::text, 'CANCELLED'::text]));

ALTER TABLE ONLY "public"."dung_cho"
  ADD CONSTRAINT "2200_24976_1_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."dung_cho"
  ADD CONSTRAINT "2200_24976_2_not_null" CHECK magiamgiaid IS NOT NULL;

ALTER TABLE ONLY "public"."giohang"
  ADD CONSTRAINT "2200_24735_1_not_null" CHECK magiohang IS NOT NULL;

ALTER TABLE ONLY "public"."giohang"
  ADD CONSTRAINT "2200_24735_2_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."giohang"
  ADD CONSTRAINT "2200_24735_3_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "2200_24749_1_not_null" CHECK magiohang IS NOT NULL;

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "2200_24749_2_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "2200_24749_3_not_null" CHECK soluong IS NOT NULL;

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "2200_24749_4_not_null" CHECK added_at IS NOT NULL;

ALTER TABLE ONLY "public"."giohang_chua_bienthesanpham"
  ADD CONSTRAINT "giohang_chua_bienthesanpham_soluong_check" CHECK (soluong > 0);

ALTER TABLE ONLY "public"."khuyenmai_ap_dung_sanpham"
  ADD CONSTRAINT "2200_24933_1_not_null" CHECK khuyenmaiid IS NOT NULL;

ALTER TABLE ONLY "public"."khuyenmai_ap_dung_sanpham"
  ADD CONSTRAINT "2200_24933_2_not_null" CHECK sanphamid IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_10_not_null" CHECK soluongdadung IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_11_not_null" CHECK gioihanmoiuser IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_12_not_null" CHECK giatridonhangtoithieu IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_14_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_15_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_1_not_null" CHECK magiamgiaid IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_2_not_null" CHECK code IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_4_not_null" CHECK loaigiamgia IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_7_not_null" CHECK thoigianbatdau IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_8_not_null" CHECK thoigianketthuc IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "2200_24950_9_not_null" CHECK soluongtoida IS NOT NULL;

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "ck_coupon_mode" CHECK (((loaigiamgia = 'FIXED'::text) AND (giatrigiamcodinh IS NOT NULL) AND (tylegiam IS NULL)) OR ((loaigiamgia = 'PERCENT'::text) AND (tylegiam IS NOT NULL) AND (giatrigiamcodinh IS NULL)));

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "ck_coupon_time" CHECK (thoigianketthuc > thoigianbatdau);

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "ck_coupon_used_le_total" CHECK (soluongdadung <= soluongtoida);

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_giamtoida_check" CHECK ((giamtoida IS NULL) OR (giamtoida >= (0)::numeric));

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_giatridonhangtoithieu_check" CHECK (giatridonhangtoithieu >= (0)::numeric);

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_giatrigiamcodinh_check" CHECK ((giatrigiamcodinh IS NULL) OR (giatrigiamcodinh >= (0)::numeric));

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_gioihanmoiuser_check" CHECK (gioihanmoiuser >= 1);

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_loaigiamgia_check" CHECK (loaigiamgia = ANY (ARRAY['FIXED'::text, 'PERCENT'::text]));

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_soluongdadung_check" CHECK (soluongdadung >= 0);

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_soluongtoida_check" CHECK (soluongtoida >= 0);

ALTER TABLE ONLY "public"."magiamgia"
  ADD CONSTRAINT "magiamgia_tylegiam_check" CHECK ((tylegiam IS NULL) OR ((tylegiam > (0)::numeric) AND (tylegiam <= (100)::numeric)));

ALTER TABLE ONLY "public"."mang"
  ADD CONSTRAINT "2200_24716_1_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."mang"
  ADD CONSTRAINT "2200_24716_2_not_null" CHECK thuoctinhid IS NOT NULL;

ALTER TABLE ONLY "public"."mang"
  ADD CONSTRAINT "2200_24716_3_not_null" CHECK giatri IS NOT NULL;

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "2200_24601_1_not_null" CHECK nhacungcapid IS NOT NULL;

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "2200_24601_2_not_null" CHECK ten IS NOT NULL;

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "2200_24601_3_not_null" CHECK tenviettat IS NOT NULL;

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "2200_24601_4_not_null" CHECK email IS NOT NULL;

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "2200_24601_5_not_null" CHECK sdt IS NOT NULL;

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "2200_24601_7_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."nhacungcap"
  ADD CONSTRAINT "2200_24601_8_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_1_not_null" CHECK nhapmaid IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_2_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_3_not_null" CHECK magiamgiaid IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_4_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_5_not_null" CHECK donhangid IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_6_not_null" CHECK thoidiem IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_7_not_null" CHECK sotiengiamthucte IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "2200_24994_8_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "nhap_ma_sotiengiamthucte_check" CHECK (sotiengiamthucte >= (0)::numeric);

ALTER TABLE ONLY "public"."nhap_ma"
  ADD CONSTRAINT "nhap_ma_trangthai_check" CHECK (trangthai = ANY (ARRAY['APPLIED'::text, 'CANCELLED'::text, 'REFUNDED'::text]));

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "2200_24856_1_not_null" CHECK donhangid IS NOT NULL;

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "2200_24856_2_not_null" CHECK bentheid IS NOT NULL;

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "2200_24856_3_not_null" CHECK soluong IS NOT NULL;

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "2200_24856_4_not_null" CHECK dongia IS NOT NULL;

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "ordor_gom_dongia_check" CHECK (dongia >= (0)::numeric);

ALTER TABLE ONLY "public"."ordor_gom"
  ADD CONSTRAINT "ordor_gom_soluong_check" CHECK (soluong > 0);

ALTER TABLE ONLY "public"."pgmigrations"
  ADD CONSTRAINT "2200_24577_1_not_null" CHECK id IS NOT NULL;

ALTER TABLE ONLY "public"."pgmigrations"
  ADD CONSTRAINT "2200_24577_2_not_null" CHECK name IS NOT NULL;

ALTER TABLE ONLY "public"."pgmigrations"
  ADD CONSTRAINT "2200_24577_3_not_null" CHECK run_on IS NOT NULL;

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "2200_32769_1_not_null" CHECK phienid IS NOT NULL;

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "2200_32769_2_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "2200_32769_3_not_null" CHECK refresh_hash IS NOT NULL;

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "2200_32769_5_not_null" CHECK expires_at IS NOT NULL;

ALTER TABLE ONLY "public"."phien_dang_nhap"
  ADD CONSTRAINT "2200_32769_6_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."phuongthucthanhtoan"
  ADD CONSTRAINT "2200_24629_1_not_null" CHECK phuongthucid IS NOT NULL;

ALTER TABLE ONLY "public"."phuongthucthanhtoan"
  ADD CONSTRAINT "2200_24629_2_not_null" CHECK ten IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_10_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_1_not_null" CHECK sanphamid IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_2_not_null" CHECK danhmucid IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_3_not_null" CHECK nhacungcapid IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_4_not_null" CHECK ten IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_5_not_null" CHECK motangan IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_6_not_null" CHECK motachitiet IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_7_not_null" CHECK tenviettat IS NOT NULL;

ALTER TABLE ONLY "public"."sanpham"
  ADD CONSTRAINT "2200_24647_9_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinh"
  ADD CONSTRAINT "2200_24638_1_not_null" CHECK thuoctinhid IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinh"
  ADD CONSTRAINT "2200_24638_2_not_null" CHECK tenthuoctinh IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinh"
  ADD CONSTRAINT "2200_24638_4_not_null" CHECK kieudulieu IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "2200_24694_1_not_null" CHECK dmttid IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "2200_24694_2_not_null" CHECK danhmucid IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "2200_24694_3_not_null" CHECK thuoctinhid IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "2200_24694_4_not_null" CHECK batbuoc IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "2200_24694_5_not_null" CHECK thutuhienthi IS NOT NULL;

ALTER TABLE ONLY "public"."thuoctinhdanhmuc"
  ADD CONSTRAINT "thuoctinhdanhmuc_thutuhienthi_check" CHECK (thutuhienthi >= 0);

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_10_not_null" CHECK macdinh IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_11_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_1_not_null" CHECK diachiuserid IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_2_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_3_not_null" CHECK tennguoinhan IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_4_not_null" CHECK sdtnguoinhan IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_5_not_null" CHECK tinhthanh IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_6_not_null" CHECK quanhuyen IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_7_not_null" CHECK phuongxa IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_8_not_null" CHECK diachichitiet IS NOT NULL;

ALTER TABLE ONLY "public"."user_address"
  ADD CONSTRAINT "2200_24800_9_not_null" CHECK loaidiachi IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_10_not_null" CHECK role IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_1_not_null" CHECK userid IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_2_not_null" CHECK tendangnhap IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_3_not_null" CHECK matkhau IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_4_not_null" CHECK email IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_5_not_null" CHECK sdt IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_6_not_null" CHECK hoten IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_8_not_null" CHECK trangthai IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "2200_24584_9_not_null" CHECK created_at IS NOT NULL;

ALTER TABLE ONLY "public"."users"
  ADD CONSTRAINT "users_role_check" CHECK ((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[]));

COMMIT;
