import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import catalogRoutes from "./modules/catalog/catalog.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import addressRoutes from "./modules/address/address.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js";
import promotionRoutes from "./modules/promotion/promotion.routes.js";
import couponRoutes from "./modules/coupon/coupon.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import postRoutes from "./modules/post/post.routes.js";
import attributeRoutes from "./modules/attribute/attribute.routes.js";
import bannerRoutes from "./modules/banner/banner.routes.js";
import storeRoutes from "./modules/store/store.routes.js";
import { notFound, errorHandler } from "./handlers/errorHandler.js";

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:3000", // Next.js
  "http://localhost:5173", // Vite (nếu còn dùng)
];

app.use(
  cors({
    origin: (origin, cb) => {
      // cho phép Postman/curl (không có origin)
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options("*", cors());
app.use(express.json());

app.use("/api/catalog", catalogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment-methods", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", attributeRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/store", storeRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
