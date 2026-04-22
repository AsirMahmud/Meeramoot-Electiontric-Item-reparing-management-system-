import { Router } from "express";
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> feature/moderation-ui
import prisma from "../models/prisma.js";
import authRoutes from "./auth-routes.js";
import shopRoutes from "./shop-routes.js";
import paymentRoutes from "./payment-routes.js";
import { APP_DISPLAY_NAME, APP_SLUG } from "../config/app.js";
<<<<<<< HEAD
=======
import authRoutes from "./auth-routes";
import shopRoutes from "./shop-routes";
import notificationRoutes from "./notification-routes";
import { APP_DISPLAY_NAME, APP_SLUG } from "../config/app";
import profileRoutes from "./profile-routes.js";

import requestRoutes from "./request-routes.js";

>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba
=======
>>>>>>> feature/moderation-ui

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      ok: true,
      app: APP_DISPLAY_NAME,
      slug: APP_SLUG,
      database: { connected: true },
    });
  } catch (error) {
    console.error("health check error:", error);
    res.status(503).json({
      ok: false,
      app: APP_DISPLAY_NAME,
      slug: APP_SLUG,
      database: { connected: false },
      message: "Database unavailable",
    });
  }
});

router.use("/auth", authRoutes);
router.use("/shops", shopRoutes);
router.use("/payments", paymentRoutes);

export default router;