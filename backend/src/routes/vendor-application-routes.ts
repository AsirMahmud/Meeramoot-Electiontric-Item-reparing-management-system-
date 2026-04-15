import { Router } from "express";
import { createVendorApplication } from "../controllers/vendor-application-controller.js";

const router = Router();

router.post("/", createVendorApplication);

export default router;