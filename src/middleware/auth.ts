import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

export interface AuthRequest extends Request {
	user?: JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized: Token missing",
		});
	}

	const token = authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized: Token missing",
		});
	}

	try {
		const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
		req.user = decoded;
		return next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized: Invalid token",
		});
	}
};
