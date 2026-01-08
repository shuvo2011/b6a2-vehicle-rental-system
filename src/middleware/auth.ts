import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.headers.authorization?.trim();

			if (!token) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized: token missing",
				});
			}

			const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;

			req.user = decoded;

			// roles check (optional)
			if (roles.length && !roles.includes((decoded as any).role)) {
				return res.status(403).json({ success: false, message: "Forbidden" });
			}

			return next();
		} catch (error: any) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized: invalid or expired token",
			});
		}
	};
};

export default auth;
