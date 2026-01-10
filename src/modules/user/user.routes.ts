import express, { Request, Response } from "express";
import { userControllers } from "./user.controller";
import { verifyToken } from "../../middleware/auth";
import { adminOnly } from "../../middleware/adminOnly";
import { adminOrOwn } from "../../middleware/adminOrOwn";

const router = express.Router();

router.get("/", verifyToken, adminOnly, userControllers.getUsers);

router.put("/:id", verifyToken, adminOrOwn, userControllers.updateUser);

router.delete("/:id", verifyToken, adminOnly, userControllers.deleteUser);

export const userRoutes = router;
