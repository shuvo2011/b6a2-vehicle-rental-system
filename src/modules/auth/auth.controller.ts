import { Request, Response } from "express";
import { authServices } from "./auth.service";

const registerUser = async (req: Request, res: Response) => {
	const { name, email, password, phone } = req.body;

	try {
		const result = await authServices.registerUser({
			name,
			email,
			password,
			phone,
		});

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: result,
		});
	} catch (err: any) {
		res.status(err.status || 500).json({
			success: false,
			message: err.message,
		});
	}
};

const loginUser = async (req: Request, res: Response) => {
	if (!req.body) {
		return res.status(400).json({
			success: false,
			message: "Request body missing. Send JSON body with email & password.",
		});
	}

	const { email, password } = req.body;

	try {
		const result = await authServices.loginUser(email, password);

		res.status(200).json({
			success: true,
			message: "Login successfully",
			data: result,
		});
	} catch (err: any) {
		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
};

export const authController = {
	loginUser,
	registerUser,
};
