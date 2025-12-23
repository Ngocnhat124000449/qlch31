--
-- PostgreSQL database dump
--

\restrict 27CQZ7tulCxH3TeV2L1mDXnTTbJKdcDi3RvtpOhs6jwDaqhx3du4IdqhHDLfqsY

-- Dumped from database version 17.7 (bdc8956)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: baidang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baidang (
    baidangid bigint NOT NULL,
    userid bigint NOT NULL,
    tieude text NOT NULL,
    tomtat text NOT NULL,
    noidung text NOT NULL,
    hinhanhurl character varying(255),
    loaibaidang text NOT NULL,
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: baidang_baidangid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.baidang_baidangid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: baidang_baidangid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.baidang_baidangid_seq OWNED BY public.baidang.baidangid;


--
-- Name: banner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banner (
    bannerid bigint NOT NULL,
    ten character varying(255) NOT NULL,
    mota text,
    imageurl text NOT NULL,
    linkurl text,
    vitri character varying(50) DEFAULT 'HOME_TOP'::character varying NOT NULL,
    thutuhienthi integer DEFAULT 0 NOT NULL,
    trangthai boolean DEFAULT true NOT NULL,
    thoigianbatdau timestamp with time zone,
    thoigianketthuc timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT banner_thutuhienthi_check CHECK ((thutuhienthi >= 0)),
    CONSTRAINT ck_banner_time CHECK (((thoigianketthuc IS NULL) OR (thoigianbatdau IS NULL) OR (thoigianketthuc > thoigianbatdau)))
);


--
-- Name: banner_bannerid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banner_bannerid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banner_bannerid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banner_bannerid_seq OWNED BY public.banner.bannerid;


--
-- Name: bao_gom; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bao_gom (
    danhsachyeuthichid bigint NOT NULL,
    bentheid bigint NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bienthe_sanpham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bienthe_sanpham (
    bentheid bigint NOT NULL,
    sanphamid bigint NOT NULL,
    sku character varying(100),
    giaban numeric(12,2) NOT NULL,
    tonkho integer DEFAULT 0 NOT NULL,
    hinhanhurl character varying(255),
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bienthe_sanpham_giaban_check CHECK ((giaban >= (0)::numeric)),
    CONSTRAINT bienthe_sanpham_tonkho_check CHECK ((tonkho >= 0))
);


--
-- Name: bienthe_sampham; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.bienthe_sampham AS
 SELECT bentheid,
    sanphamid,
    sku,
    giaban,
    tonkho,
    hinhanhurl,
    trangthai,
    created_at
   FROM public.bienthe_sanpham;


--
-- Name: bienthe_sanpham_bentheid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bienthe_sanpham_bentheid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bienthe_sanpham_bentheid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bienthe_sanpham_bentheid_seq OWNED BY public.bienthe_sanpham.bentheid;


--
-- Name: chuongtrinhkhuyenmai; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chuongtrinhkhuyenmai (
    khuyenmaiid bigint NOT NULL,
    tenkhuyenmai text NOT NULL,
    mota text,
    loaigiamgia text NOT NULL,
    giatrigiamcodinh numeric(12,2),
    tylegiam numeric(5,2),
    thoigianbatdau timestamp with time zone NOT NULL,
    thoigianketthuc timestamp with time zone NOT NULL,
    trangthai boolean DEFAULT true NOT NULL,
    cothecongdon boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chuongtrinhkhuyenmai_giatrigiamcodinh_check CHECK (((giatrigiamcodinh IS NULL) OR (giatrigiamcodinh >= (0)::numeric))),
    CONSTRAINT chuongtrinhkhuyenmai_loaigiamgia_check CHECK ((loaigiamgia = ANY (ARRAY['FIXED'::text, 'PERCENT'::text]))),
    CONSTRAINT chuongtrinhkhuyenmai_tylegiam_check CHECK (((tylegiam IS NULL) OR ((tylegiam > (0)::numeric) AND (tylegiam <= (100)::numeric)))),
    CONSTRAINT ck_km_mode CHECK ((((loaigiamgia = 'FIXED'::text) AND (giatrigiamcodinh IS NOT NULL) AND (tylegiam IS NULL)) OR ((loaigiamgia = 'PERCENT'::text) AND (tylegiam IS NOT NULL) AND (giatrigiamcodinh IS NULL)))),
    CONSTRAINT ck_km_time CHECK ((thoigianketthuc > thoigianbatdau))
);


--
-- Name: chuongtrinhkhuyenmai_khuyenmaiid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chuongtrinhkhuyenmai_khuyenmaiid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chuongtrinhkhuyenmai_khuyenmaiid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chuongtrinhkhuyenmai_khuyenmaiid_seq OWNED BY public.chuongtrinhkhuyenmai.khuyenmaiid;


--
-- Name: danhgia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.danhgia (
    danhgiaid bigint NOT NULL,
    bentheid bigint NOT NULL,
    userid bigint NOT NULL,
    sosao integer NOT NULL,
    tieude text,
    noidung text,
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT danhgia_sosao_check CHECK (((sosao >= 1) AND (sosao <= 5)))
);


--
-- Name: danhgia_danhgiaid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.danhgia_danhgiaid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: danhgia_danhgiaid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.danhgia_danhgiaid_seq OWNED BY public.danhgia.danhgiaid;


--
-- Name: danhmuc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.danhmuc (
    danhmucid bigint NOT NULL,
    ten character varying(255) NOT NULL,
    tenviettat character varying(255) NOT NULL,
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: danhmuc_danhmucid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.danhmuc_danhmucid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: danhmuc_danhmucid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.danhmuc_danhmucid_seq OWNED BY public.danhmuc.danhmucid;


--
-- Name: danhsachyeuthich; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.danhsachyeuthich (
    danhsachyeuthichid bigint NOT NULL,
    userid bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: danhsachyeuthich_danhsachyeuthichid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.danhsachyeuthich_danhsachyeuthichid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: danhsachyeuthich_danhsachyeuthichid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.danhsachyeuthich_danhsachyeuthichid_seq OWNED BY public.danhsachyeuthich.danhsachyeuthichid;


--
-- Name: donhang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donhang (
    donhangid bigint NOT NULL,
    phuongthucid bigint NOT NULL,
    userid bigint NOT NULL,
    diachiuserid bigint NOT NULL,
    tongtien numeric(12,2) NOT NULL,
    phivanchuyen numeric(12,2) NOT NULL,
    tongthanhtoan numeric(12,2) NOT NULL,
    trangthai text DEFAULT 'PENDING'::text NOT NULL,
    ghichu character varying(200),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_order_total CHECK ((tongthanhtoan = (tongtien + phivanchuyen))),
    CONSTRAINT donhang_phivanchuyen_check CHECK ((phivanchuyen >= (0)::numeric)),
    CONSTRAINT donhang_tongthanhtoan_check CHECK ((tongthanhtoan >= (0)::numeric)),
    CONSTRAINT donhang_tongtien_check CHECK ((tongtien >= (0)::numeric)),
    CONSTRAINT donhang_trangthai_check CHECK ((trangthai = ANY (ARRAY['PENDING'::text, 'PAID'::text, 'SHIPPED'::text, 'COMPLETED'::text, 'CANCELLED'::text])))
);


--
-- Name: donhang_donhangid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.donhang_donhangid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: donhang_donhangid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.donhang_donhangid_seq OWNED BY public.donhang.donhangid;


--
-- Name: dung_cho; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dung_cho (
    bentheid bigint NOT NULL,
    magiamgiaid bigint NOT NULL
);


--
-- Name: giohang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.giohang (
    magiohang bigint NOT NULL,
    userid bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: giohang_chua_bienthesanpham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.giohang_chua_bienthesanpham (
    magiohang bigint NOT NULL,
    bentheid bigint NOT NULL,
    soluong integer NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT giohang_chua_bienthesanpham_soluong_check CHECK ((soluong > 0))
);


--
-- Name: giohang_magiohang_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.giohang_magiohang_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: giohang_magiohang_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.giohang_magiohang_seq OWNED BY public.giohang.magiohang;


--
-- Name: khuyenmai_ap_dung_sanpham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.khuyenmai_ap_dung_sanpham (
    khuyenmaiid bigint NOT NULL,
    sanphamid bigint NOT NULL
);


--
-- Name: magiamgia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.magiamgia (
    magiamgiaid bigint NOT NULL,
    code character varying(50) NOT NULL,
    tenma text,
    loaigiamgia text NOT NULL,
    giatrigiamcodinh numeric(12,2),
    tylegiam numeric(5,2),
    thoigianbatdau timestamp with time zone NOT NULL,
    thoigianketthuc timestamp with time zone NOT NULL,
    soluongtoida integer NOT NULL,
    soluongdadung integer DEFAULT 0 NOT NULL,
    gioihanmoiuser integer DEFAULT 1 NOT NULL,
    giatridonhangtoithieu numeric(12,2) DEFAULT 0 NOT NULL,
    giamtoida numeric(12,2),
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_coupon_mode CHECK ((((loaigiamgia = 'FIXED'::text) AND (giatrigiamcodinh IS NOT NULL) AND (tylegiam IS NULL)) OR ((loaigiamgia = 'PERCENT'::text) AND (tylegiam IS NOT NULL) AND (giatrigiamcodinh IS NULL)))),
    CONSTRAINT ck_coupon_time CHECK ((thoigianketthuc > thoigianbatdau)),
    CONSTRAINT ck_coupon_used_le_total CHECK ((soluongdadung <= soluongtoida)),
    CONSTRAINT magiamgia_giamtoida_check CHECK (((giamtoida IS NULL) OR (giamtoida >= (0)::numeric))),
    CONSTRAINT magiamgia_giatridonhangtoithieu_check CHECK ((giatridonhangtoithieu >= (0)::numeric)),
    CONSTRAINT magiamgia_giatrigiamcodinh_check CHECK (((giatrigiamcodinh IS NULL) OR (giatrigiamcodinh >= (0)::numeric))),
    CONSTRAINT magiamgia_gioihanmoiuser_check CHECK ((gioihanmoiuser >= 1)),
    CONSTRAINT magiamgia_loaigiamgia_check CHECK ((loaigiamgia = ANY (ARRAY['FIXED'::text, 'PERCENT'::text]))),
    CONSTRAINT magiamgia_soluongdadung_check CHECK ((soluongdadung >= 0)),
    CONSTRAINT magiamgia_soluongtoida_check CHECK ((soluongtoida >= 0)),
    CONSTRAINT magiamgia_tylegiam_check CHECK (((tylegiam IS NULL) OR ((tylegiam > (0)::numeric) AND (tylegiam <= (100)::numeric))))
);


--
-- Name: magiamgia_magiamgiaid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.magiamgia_magiamgiaid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: magiamgia_magiamgiaid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.magiamgia_magiamgiaid_seq OWNED BY public.magiamgia.magiamgiaid;


--
-- Name: mang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mang (
    bentheid bigint NOT NULL,
    thuoctinhid bigint NOT NULL,
    giatri text NOT NULL
);


--
-- Name: nhacungcap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nhacungcap (
    nhacungcapid bigint NOT NULL,
    ten character varying(255) NOT NULL,
    tenviettat character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    sdt character varying(255) NOT NULL,
    logourl character varying(255),
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: nhacungcap_nhacungcapid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nhacungcap_nhacungcapid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nhacungcap_nhacungcapid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nhacungcap_nhacungcapid_seq OWNED BY public.nhacungcap.nhacungcapid;


--
-- Name: nhap_ma; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nhap_ma (
    nhapmaid bigint NOT NULL,
    userid bigint NOT NULL,
    magiamgiaid bigint NOT NULL,
    bentheid bigint NOT NULL,
    donhangid bigint NOT NULL,
    thoidiem timestamp with time zone DEFAULT now() NOT NULL,
    sotiengiamthucte numeric(12,2) DEFAULT 0 NOT NULL,
    trangthai text DEFAULT 'APPLIED'::text NOT NULL,
    CONSTRAINT nhap_ma_sotiengiamthucte_check CHECK ((sotiengiamthucte >= (0)::numeric)),
    CONSTRAINT nhap_ma_trangthai_check CHECK ((trangthai = ANY (ARRAY['APPLIED'::text, 'CANCELLED'::text, 'REFUNDED'::text])))
);


--
-- Name: nhap_ma_nhapmaid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nhap_ma_nhapmaid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nhap_ma_nhapmaid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nhap_ma_nhapmaid_seq OWNED BY public.nhap_ma.nhapmaid;


--
-- Name: ordor_gom; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ordor_gom (
    donhangid bigint NOT NULL,
    bentheid bigint NOT NULL,
    soluong integer NOT NULL,
    dongia numeric(12,2) NOT NULL,
    CONSTRAINT ordor_gom_dongia_check CHECK ((dongia >= (0)::numeric)),
    CONSTRAINT ordor_gom_soluong_check CHECK ((soluong > 0))
);


--
-- Name: pgmigrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pgmigrations_id_seq OWNED BY public.pgmigrations.id;


--
-- Name: phien_dang_nhap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phien_dang_nhap (
    phienid bigint NOT NULL,
    userid bigint NOT NULL,
    refresh_hash text NOT NULL,
    revoked_at timestamp with time zone,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: phien_dang_nhap_phienid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.phien_dang_nhap_phienid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: phien_dang_nhap_phienid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.phien_dang_nhap_phienid_seq OWNED BY public.phien_dang_nhap.phienid;


--
-- Name: phuongthucthanhtoan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phuongthucthanhtoan (
    phuongthucid bigint NOT NULL,
    ten character varying(255) NOT NULL
);


--
-- Name: phuongthucthanhtoan_phuongthucid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.phuongthucthanhtoan_phuongthucid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: phuongthucthanhtoan_phuongthucid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.phuongthucthanhtoan_phuongthucid_seq OWNED BY public.phuongthucthanhtoan.phuongthucid;


--
-- Name: sanpham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sanpham (
    sanphamid bigint NOT NULL,
    danhmucid bigint NOT NULL,
    nhacungcapid bigint NOT NULL,
    ten character varying(255) NOT NULL,
    motangan text NOT NULL,
    motachitiet text NOT NULL,
    tenviettat character varying(255) NOT NULL,
    hinhanhurl character varying(255),
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sanpham_sanphamid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sanpham_sanphamid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sanpham_sanphamid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sanpham_sanphamid_seq OWNED BY public.sanpham.sanphamid;


--
-- Name: thuoctinh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.thuoctinh (
    thuoctinhid bigint NOT NULL,
    tenthuoctinh character varying(255) NOT NULL,
    donvitinh character varying(255),
    kieudulieu character varying(255) NOT NULL,
    mota text
);


--
-- Name: thuoctinh_thuoctinhid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.thuoctinh_thuoctinhid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: thuoctinh_thuoctinhid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.thuoctinh_thuoctinhid_seq OWNED BY public.thuoctinh.thuoctinhid;


--
-- Name: thuoctinhdanhmuc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.thuoctinhdanhmuc (
    dmttid bigint NOT NULL,
    danhmucid bigint NOT NULL,
    thuoctinhid bigint NOT NULL,
    batbuoc boolean DEFAULT false NOT NULL,
    thutuhienthi integer DEFAULT 0 NOT NULL,
    CONSTRAINT thuoctinhdanhmuc_thutuhienthi_check CHECK ((thutuhienthi >= 0))
);


--
-- Name: thuoctinhdanhmuc_dmttid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.thuoctinhdanhmuc_dmttid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: thuoctinhdanhmuc_dmttid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.thuoctinhdanhmuc_dmttid_seq OWNED BY public.thuoctinhdanhmuc.dmttid;


--
-- Name: user_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_address (
    diachiuserid bigint NOT NULL,
    userid bigint NOT NULL,
    tennguoinhan character varying(255) NOT NULL,
    sdtnguoinhan character varying(15) NOT NULL,
    tinhthanh character varying(255) NOT NULL,
    quanhuyen character varying(255) NOT NULL,
    phuongxa character varying(255) NOT NULL,
    diachichitiet text NOT NULL,
    loaidiachi character varying(30) NOT NULL,
    macdinh boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: uer_address; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.uer_address AS
 SELECT diachiuserid,
    userid,
    tennguoinhan,
    sdtnguoinhan,
    tinhthanh,
    quanhuyen,
    phuongxa,
    diachichitiet,
    loaidiachi,
    macdinh,
    created_at
   FROM public.user_address;


--
-- Name: user_address_diachiuserid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_address_diachiuserid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_address_diachiuserid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_address_diachiuserid_seq OWNED BY public.user_address.diachiuserid;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    userid bigint NOT NULL,
    tendangnhap character varying(255) NOT NULL,
    matkhau character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    sdt character varying(255) NOT NULL,
    hoten character varying(255) NOT NULL,
    avatarurl character varying(255),
    trangthai boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: user_profile; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_profile AS
 SELECT u.userid,
    u.tendangnhap,
    u.email,
    u.sdt,
    u.hoten,
    u.avatarurl,
    u.trangthai,
    u.created_at,
    gh.magiohang,
    wl.danhsachyeuthichid
   FROM ((public.users u
     LEFT JOIN public.giohang gh ON ((gh.userid = u.userid)))
     LEFT JOIN public.danhsachyeuthich wl ON ((wl.userid = u.userid)));


--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_userid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: baidang baidangid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baidang ALTER COLUMN baidangid SET DEFAULT nextval('public.baidang_baidangid_seq'::regclass);


--
-- Name: banner bannerid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner ALTER COLUMN bannerid SET DEFAULT nextval('public.banner_bannerid_seq'::regclass);


--
-- Name: bienthe_sanpham bentheid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bienthe_sanpham ALTER COLUMN bentheid SET DEFAULT nextval('public.bienthe_sanpham_bentheid_seq'::regclass);


--
-- Name: chuongtrinhkhuyenmai khuyenmaiid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chuongtrinhkhuyenmai ALTER COLUMN khuyenmaiid SET DEFAULT nextval('public.chuongtrinhkhuyenmai_khuyenmaiid_seq'::regclass);


--
-- Name: danhgia danhgiaid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhgia ALTER COLUMN danhgiaid SET DEFAULT nextval('public.danhgia_danhgiaid_seq'::regclass);


--
-- Name: danhmuc danhmucid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhmuc ALTER COLUMN danhmucid SET DEFAULT nextval('public.danhmuc_danhmucid_seq'::regclass);


--
-- Name: danhsachyeuthich danhsachyeuthichid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhsachyeuthich ALTER COLUMN danhsachyeuthichid SET DEFAULT nextval('public.danhsachyeuthich_danhsachyeuthichid_seq'::regclass);


--
-- Name: donhang donhangid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donhang ALTER COLUMN donhangid SET DEFAULT nextval('public.donhang_donhangid_seq'::regclass);


--
-- Name: giohang magiohang; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giohang ALTER COLUMN magiohang SET DEFAULT nextval('public.giohang_magiohang_seq'::regclass);


--
-- Name: magiamgia magiamgiaid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magiamgia ALTER COLUMN magiamgiaid SET DEFAULT nextval('public.magiamgia_magiamgiaid_seq'::regclass);


--
-- Name: nhacungcap nhacungcapid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhacungcap ALTER COLUMN nhacungcapid SET DEFAULT nextval('public.nhacungcap_nhacungcapid_seq'::regclass);


--
-- Name: nhap_ma nhapmaid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma ALTER COLUMN nhapmaid SET DEFAULT nextval('public.nhap_ma_nhapmaid_seq'::regclass);


--
-- Name: pgmigrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pgmigrations ALTER COLUMN id SET DEFAULT nextval('public.pgmigrations_id_seq'::regclass);


--
-- Name: phien_dang_nhap phienid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phien_dang_nhap ALTER COLUMN phienid SET DEFAULT nextval('public.phien_dang_nhap_phienid_seq'::regclass);


--
-- Name: phuongthucthanhtoan phuongthucid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phuongthucthanhtoan ALTER COLUMN phuongthucid SET DEFAULT nextval('public.phuongthucthanhtoan_phuongthucid_seq'::regclass);


--
-- Name: sanpham sanphamid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sanpham ALTER COLUMN sanphamid SET DEFAULT nextval('public.sanpham_sanphamid_seq'::regclass);


--
-- Name: thuoctinh thuoctinhid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoctinh ALTER COLUMN thuoctinhid SET DEFAULT nextval('public.thuoctinh_thuoctinhid_seq'::regclass);


--
-- Name: thuoctinhdanhmuc dmttid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoctinhdanhmuc ALTER COLUMN dmttid SET DEFAULT nextval('public.thuoctinhdanhmuc_dmttid_seq'::regclass);


--
-- Name: user_address diachiuserid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_address ALTER COLUMN diachiuserid SET DEFAULT nextval('public.user_address_diachiuserid_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Name: baidang baidang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baidang
    ADD CONSTRAINT baidang_pkey PRIMARY KEY (baidangid);


--
-- Name: banner banner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banner
    ADD CONSTRAINT banner_pkey PRIMARY KEY (bannerid);


--
-- Name: bao_gom bao_gom_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bao_gom
    ADD CONSTRAINT bao_gom_pkey PRIMARY KEY (danhsachyeuthichid, bentheid);


--
-- Name: bienthe_sanpham bienthe_sanpham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bienthe_sanpham
    ADD CONSTRAINT bienthe_sanpham_pkey PRIMARY KEY (bentheid);


--
-- Name: chuongtrinhkhuyenmai chuongtrinhkhuyenmai_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chuongtrinhkhuyenmai
    ADD CONSTRAINT chuongtrinhkhuyenmai_pkey PRIMARY KEY (khuyenmaiid);


--
-- Name: danhgia danhgia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhgia
    ADD CONSTRAINT danhgia_pkey PRIMARY KEY (danhgiaid);


--
-- Name: danhmuc danhmuc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhmuc
    ADD CONSTRAINT danhmuc_pkey PRIMARY KEY (danhmucid);


--
-- Name: danhsachyeuthich danhsachyeuthich_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhsachyeuthich
    ADD CONSTRAINT danhsachyeuthich_pkey PRIMARY KEY (danhsachyeuthichid);


--
-- Name: danhsachyeuthich danhsachyeuthich_userid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhsachyeuthich
    ADD CONSTRAINT danhsachyeuthich_userid_key UNIQUE (userid);


--
-- Name: donhang donhang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donhang
    ADD CONSTRAINT donhang_pkey PRIMARY KEY (donhangid);


--
-- Name: dung_cho dung_cho_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dung_cho
    ADD CONSTRAINT dung_cho_pkey PRIMARY KEY (bentheid, magiamgiaid);


--
-- Name: giohang_chua_bienthesanpham giohang_chua_bienthesanpham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giohang_chua_bienthesanpham
    ADD CONSTRAINT giohang_chua_bienthesanpham_pkey PRIMARY KEY (magiohang, bentheid);


--
-- Name: giohang giohang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giohang
    ADD CONSTRAINT giohang_pkey PRIMARY KEY (magiohang);


--
-- Name: giohang giohang_userid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giohang
    ADD CONSTRAINT giohang_userid_key UNIQUE (userid);


--
-- Name: khuyenmai_ap_dung_sanpham khuyenmai_ap_dung_sanpham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.khuyenmai_ap_dung_sanpham
    ADD CONSTRAINT khuyenmai_ap_dung_sanpham_pkey PRIMARY KEY (khuyenmaiid, sanphamid);


--
-- Name: magiamgia magiamgia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magiamgia
    ADD CONSTRAINT magiamgia_pkey PRIMARY KEY (magiamgiaid);


--
-- Name: mang mang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mang
    ADD CONSTRAINT mang_pkey PRIMARY KEY (bentheid, thuoctinhid);


--
-- Name: nhacungcap nhacungcap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhacungcap
    ADD CONSTRAINT nhacungcap_pkey PRIMARY KEY (nhacungcapid);


--
-- Name: nhap_ma nhap_ma_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT nhap_ma_pkey PRIMARY KEY (nhapmaid);


--
-- Name: ordor_gom ordor_gom_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordor_gom
    ADD CONSTRAINT ordor_gom_pkey PRIMARY KEY (donhangid, bentheid);


--
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- Name: phien_dang_nhap phien_dang_nhap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phien_dang_nhap
    ADD CONSTRAINT phien_dang_nhap_pkey PRIMARY KEY (phienid);


--
-- Name: phien_dang_nhap phien_dang_nhap_refresh_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phien_dang_nhap
    ADD CONSTRAINT phien_dang_nhap_refresh_hash_key UNIQUE (refresh_hash);


--
-- Name: phuongthucthanhtoan phuongthucthanhtoan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phuongthucthanhtoan
    ADD CONSTRAINT phuongthucthanhtoan_pkey PRIMARY KEY (phuongthucid);


--
-- Name: sanpham sanpham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sanpham
    ADD CONSTRAINT sanpham_pkey PRIMARY KEY (sanphamid);


--
-- Name: thuoctinh thuoctinh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoctinh
    ADD CONSTRAINT thuoctinh_pkey PRIMARY KEY (thuoctinhid);


--
-- Name: thuoctinhdanhmuc thuoctinhdanhmuc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoctinhdanhmuc
    ADD CONSTRAINT thuoctinhdanhmuc_pkey PRIMARY KEY (dmttid);


--
-- Name: user_address uq_address_user_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT uq_address_user_pair UNIQUE (userid, diachiuserid);


--
-- Name: bienthe_sanpham uq_bienthe_sku; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bienthe_sanpham
    ADD CONSTRAINT uq_bienthe_sku UNIQUE (sku);


--
-- Name: danhmuc uq_danhmuc_tenviettat; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhmuc
    ADD CONSTRAINT uq_danhmuc_tenviettat UNIQUE (tenviettat);


--
-- Name: thuoctinhdanhmuc uq_dmtt; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoctinhdanhmuc
    ADD CONSTRAINT uq_dmtt UNIQUE (danhmucid, thuoctinhid);


--
-- Name: magiamgia uq_magiamgia_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magiamgia
    ADD CONSTRAINT uq_magiamgia_code UNIQUE (code);


--
-- Name: nhacungcap uq_ncc_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhacungcap
    ADD CONSTRAINT uq_ncc_email UNIQUE (email);


--
-- Name: nhacungcap uq_ncc_tenviettat; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhacungcap
    ADD CONSTRAINT uq_ncc_tenviettat UNIQUE (tenviettat);


--
-- Name: nhap_ma uq_nhapma_once; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT uq_nhapma_once UNIQUE (userid, magiamgiaid, bentheid);


--
-- Name: phuongthucthanhtoan uq_payment_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phuongthucthanhtoan
    ADD CONSTRAINT uq_payment_name UNIQUE (ten);


--
-- Name: danhgia uq_review_once; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhgia
    ADD CONSTRAINT uq_review_once UNIQUE (userid, bentheid);


--
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);


--
-- Name: users uq_users_sdt; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_sdt UNIQUE (sdt);


--
-- Name: users uq_users_tendangnhap; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_tendangnhap UNIQUE (tendangnhap);


--
-- Name: user_address user_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT user_address_pkey PRIMARY KEY (diachiuserid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: ix_address_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_address_user ON public.user_address USING btree (userid);


--
-- Name: ix_baidang_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_baidang_user ON public.baidang USING btree (userid);


--
-- Name: ix_banner_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_banner_active ON public.banner USING btree (trangthai);


--
-- Name: ix_banner_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_banner_position ON public.banner USING btree (vitri, thutuhienthi);


--
-- Name: ix_baogom_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_baogom_variant ON public.bao_gom USING btree (bentheid);


--
-- Name: ix_bienthe_sanpham; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_bienthe_sanpham ON public.bienthe_sanpham USING btree (sanphamid);


--
-- Name: ix_cartitem_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_cartitem_variant ON public.giohang_chua_bienthesanpham USING btree (bentheid);


--
-- Name: ix_dmtt_thuoctinh; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_dmtt_thuoctinh ON public.thuoctinhdanhmuc USING btree (thuoctinhid);


--
-- Name: ix_donhang_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_donhang_created ON public.donhang USING btree (created_at);


--
-- Name: ix_donhang_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_donhang_user ON public.donhang USING btree (userid);


--
-- Name: ix_dungcho_coupon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_dungcho_coupon ON public.dung_cho USING btree (magiamgiaid);


--
-- Name: ix_km_sp_sanpham; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_km_sp_sanpham ON public.khuyenmai_ap_dung_sanpham USING btree (sanphamid);


--
-- Name: ix_mang_thuoctinh; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mang_thuoctinh ON public.mang USING btree (thuoctinhid);


--
-- Name: ix_nhapma_coupon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_nhapma_coupon ON public.nhap_ma USING btree (magiamgiaid);


--
-- Name: ix_nhapma_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_nhapma_user ON public.nhap_ma USING btree (userid);


--
-- Name: ix_nhapma_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_nhapma_variant ON public.nhap_ma USING btree (bentheid);


--
-- Name: ix_orderitem_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_orderitem_variant ON public.ordor_gom USING btree (bentheid);


--
-- Name: ix_phien_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_phien_active ON public.phien_dang_nhap USING btree (userid) WHERE (revoked_at IS NULL);


--
-- Name: ix_phien_refresh_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_phien_refresh_hash ON public.phien_dang_nhap USING btree (refresh_hash);


--
-- Name: ix_phien_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_phien_user ON public.phien_dang_nhap USING btree (userid);


--
-- Name: ix_review_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_review_variant ON public.danhgia USING btree (bentheid);


--
-- Name: ix_sanpham_danhmuc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sanpham_danhmuc ON public.sanpham USING btree (danhmucid);


--
-- Name: ix_sanpham_nhacungcap; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sanpham_nhacungcap ON public.sanpham USING btree (nhacungcapid);


--
-- Name: ux_address_default_per_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_address_default_per_user ON public.user_address USING btree (userid) WHERE (macdinh = true);


--
-- Name: ux_donhang_id_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_donhang_id_user ON public.donhang USING btree (donhangid, userid);


--
-- Name: user_address fk_address_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_address
    ADD CONSTRAINT fk_address_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: bao_gom fk_baogom_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bao_gom
    ADD CONSTRAINT fk_baogom_variant FOREIGN KEY (bentheid) REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT;


--
-- Name: bao_gom fk_baogom_wishlist; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bao_gom
    ADD CONSTRAINT fk_baogom_wishlist FOREIGN KEY (danhsachyeuthichid) REFERENCES public.danhsachyeuthich(danhsachyeuthichid) ON DELETE CASCADE;


--
-- Name: bienthe_sanpham fk_bienthe_sanpham; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bienthe_sanpham
    ADD CONSTRAINT fk_bienthe_sanpham FOREIGN KEY (sanphamid) REFERENCES public.sanpham(sanphamid) ON DELETE RESTRICT;


--
-- Name: giohang_chua_bienthesanpham fk_cartitem_cart; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giohang_chua_bienthesanpham
    ADD CONSTRAINT fk_cartitem_cart FOREIGN KEY (magiohang) REFERENCES public.giohang(magiohang) ON DELETE CASCADE;


--
-- Name: giohang_chua_bienthesanpham fk_cartitem_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giohang_chua_bienthesanpham
    ADD CONSTRAINT fk_cartitem_variant FOREIGN KEY (bentheid) REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT;


--
-- Name: thuoctinhdanhmuc fk_dmtt_danhmuc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoctinhdanhmuc
    ADD CONSTRAINT fk_dmtt_danhmuc FOREIGN KEY (danhmucid) REFERENCES public.danhmuc(danhmucid) ON DELETE CASCADE;


--
-- Name: thuoctinhdanhmuc fk_dmtt_thuoctinh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thuoctinhdanhmuc
    ADD CONSTRAINT fk_dmtt_thuoctinh FOREIGN KEY (thuoctinhid) REFERENCES public.thuoctinh(thuoctinhid) ON DELETE RESTRICT;


--
-- Name: dung_cho fk_dungcho_coupon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dung_cho
    ADD CONSTRAINT fk_dungcho_coupon FOREIGN KEY (magiamgiaid) REFERENCES public.magiamgia(magiamgiaid) ON DELETE CASCADE;


--
-- Name: dung_cho fk_dungcho_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dung_cho
    ADD CONSTRAINT fk_dungcho_variant FOREIGN KEY (bentheid) REFERENCES public.bienthe_sanpham(bentheid) ON DELETE CASCADE;


--
-- Name: giohang fk_giohang_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.giohang
    ADD CONSTRAINT fk_giohang_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: khuyenmai_ap_dung_sanpham fk_km_sp_km; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.khuyenmai_ap_dung_sanpham
    ADD CONSTRAINT fk_km_sp_km FOREIGN KEY (khuyenmaiid) REFERENCES public.chuongtrinhkhuyenmai(khuyenmaiid) ON DELETE CASCADE;


--
-- Name: khuyenmai_ap_dung_sanpham fk_km_sp_sp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.khuyenmai_ap_dung_sanpham
    ADD CONSTRAINT fk_km_sp_sp FOREIGN KEY (sanphamid) REFERENCES public.sanpham(sanphamid) ON DELETE CASCADE;


--
-- Name: mang fk_mang_bienthe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mang
    ADD CONSTRAINT fk_mang_bienthe FOREIGN KEY (bentheid) REFERENCES public.bienthe_sanpham(bentheid) ON DELETE CASCADE;


--
-- Name: mang fk_mang_thuoctinh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mang
    ADD CONSTRAINT fk_mang_thuoctinh FOREIGN KEY (thuoctinhid) REFERENCES public.thuoctinh(thuoctinhid) ON DELETE RESTRICT;


--
-- Name: nhap_ma fk_nhapma_coupon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT fk_nhapma_coupon FOREIGN KEY (magiamgiaid) REFERENCES public.magiamgia(magiamgiaid) ON DELETE RESTRICT;


--
-- Name: nhap_ma fk_nhapma_dungcho; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT fk_nhapma_dungcho FOREIGN KEY (bentheid, magiamgiaid) REFERENCES public.dung_cho(bentheid, magiamgiaid) ON DELETE RESTRICT;


--
-- Name: nhap_ma fk_nhapma_order_owner; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT fk_nhapma_order_owner FOREIGN KEY (donhangid, userid) REFERENCES public.donhang(donhangid, userid) ON DELETE RESTRICT;


--
-- Name: nhap_ma fk_nhapma_ordor_gom; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT fk_nhapma_ordor_gom FOREIGN KEY (donhangid, bentheid) REFERENCES public.ordor_gom(donhangid, bentheid) ON DELETE RESTRICT;


--
-- Name: nhap_ma fk_nhapma_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT fk_nhapma_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE RESTRICT;


--
-- Name: nhap_ma fk_nhapma_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nhap_ma
    ADD CONSTRAINT fk_nhapma_variant FOREIGN KEY (bentheid) REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT;


--
-- Name: donhang fk_order_payment; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donhang
    ADD CONSTRAINT fk_order_payment FOREIGN KEY (phuongthucid) REFERENCES public.phuongthucthanhtoan(phuongthucid) ON DELETE RESTRICT;


--
-- Name: donhang fk_order_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donhang
    ADD CONSTRAINT fk_order_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE RESTRICT;


--
-- Name: donhang fk_order_user_address; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donhang
    ADD CONSTRAINT fk_order_user_address FOREIGN KEY (userid, diachiuserid) REFERENCES public.user_address(userid, diachiuserid) ON DELETE RESTRICT;


--
-- Name: ordor_gom fk_orderitem_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordor_gom
    ADD CONSTRAINT fk_orderitem_order FOREIGN KEY (donhangid) REFERENCES public.donhang(donhangid) ON DELETE CASCADE;


--
-- Name: ordor_gom fk_orderitem_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordor_gom
    ADD CONSTRAINT fk_orderitem_variant FOREIGN KEY (bentheid) REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT;


--
-- Name: baidang fk_post_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baidang
    ADD CONSTRAINT fk_post_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE RESTRICT;


--
-- Name: danhgia fk_review_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhgia
    ADD CONSTRAINT fk_review_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE RESTRICT;


--
-- Name: danhgia fk_review_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhgia
    ADD CONSTRAINT fk_review_variant FOREIGN KEY (bentheid) REFERENCES public.bienthe_sanpham(bentheid) ON DELETE RESTRICT;


--
-- Name: sanpham fk_sanpham_danhmuc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sanpham
    ADD CONSTRAINT fk_sanpham_danhmuc FOREIGN KEY (danhmucid) REFERENCES public.danhmuc(danhmucid) ON DELETE RESTRICT;


--
-- Name: sanpham fk_sanpham_nhacungcap; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sanpham
    ADD CONSTRAINT fk_sanpham_nhacungcap FOREIGN KEY (nhacungcapid) REFERENCES public.nhacungcap(nhacungcapid) ON DELETE RESTRICT;


--
-- Name: danhsachyeuthich fk_wishlist_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.danhsachyeuthich
    ADD CONSTRAINT fk_wishlist_user FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- Name: phien_dang_nhap phien_dang_nhap_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phien_dang_nhap
    ADD CONSTRAINT phien_dang_nhap_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 27CQZ7tulCxH3TeV2L1mDXnTTbJKdcDi3RvtpOhs6jwDaqhx3du4IdqhHDLfqsY

