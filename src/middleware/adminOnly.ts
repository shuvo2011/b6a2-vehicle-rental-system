import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({
			success: false,
			message: "Forbidden: Admin access only",
		});
	}

	next();
};
