import { Router } from "express";
import auth from "../../middleware/auth";
import { authController } from "./auth.controller";

const router = Router();

router.post("/signin", authController.loginUser);
router.post("/signup", authController.registerUser);

export const authRoutes = router;
