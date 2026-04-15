import { Router } from "express";
import authRoutes from "./auth-routes";
import shopRoutes from "./shop-routes";
import notificationRoutes from "./notification-routes";
import { APP_DISPLAY_NAME, APP_SLUG } from "../config/app";
import profileRoutes from "./profile-routes.js";
import vendorApplicationRoutes from "./vendor-application-routes.js";
import vendorStatusRoutes from "./vendor-status-routes.js";
import requestRoutes from "./request-routes.js";


const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    app: APP_DISPLAY_NAME,
    slug: APP_SLUG,
  });
});

router.use("/auth", authRoutes);
router.use("/shops", shopRoutes);
router.use("/profile", profileRoutes);
router.use("/notifications", notificationRoutes);
router.use("/requests", requestRoutes);
router.use("/vendor/applications", vendorApplicationRoutes);
router.use("/vendor/application-status", vendorStatusRoutes);
export default router;
