import { Router } from "express";
import { requireAuth } from "../../middlewares/authz.middleware.js";
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// cần access token
router.post("/logout-all", requireAuth(), logoutAll);

export default router;
