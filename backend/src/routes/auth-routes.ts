import { Router } from "express";
<<<<<<< HEAD
import {
	adminDemoLogin,
	login,
	signup,
} from "../controllers/auth-controller.js";
import { loginRateLimiter } from "../middleware/rate-limit.js";
=======
import { checkUsername, googleExchange, login, signup } from "../controllers/auth-controller";
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba

const router = Router();

router.post("/signup", signup);
<<<<<<< HEAD
router.post("/login", loginRateLimiter, login);
router.post("/admin-demo-login", loginRateLimiter, adminDemoLogin);
=======
router.post("/login", login);
router.post("/google-exchange", googleExchange);
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba

export default router;