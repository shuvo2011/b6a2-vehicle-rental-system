import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const adminOrOwn = (req: AuthRequest, res: Response, next: NextFunction) => {
	const requestedUserId = req.params.userId;
	const loggedInUserId = req.user?.userId;
	const role = req.user?.role;

	if (role === "admin") return next();

	if (!loggedInUserId || String(loggedInUserId) !== String(requestedUserId)) {
		return res.status(403).json({
			success: false,
			message: "Forbidden: You can update only your own profile",
		});
	}

	return next();
};
