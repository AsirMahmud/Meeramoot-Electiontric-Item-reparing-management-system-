import { Router } from "express";
import { getOpenVendorRequests } from "../controllers/vendor-request-controller";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/open", requireAuth, getOpenVendorRequests);

export default router;