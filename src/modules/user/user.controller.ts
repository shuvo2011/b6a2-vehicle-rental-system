import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userServices } from "./user.service";
import { AuthRequest } from "../../middleware/auth";

const getUsers = async (req: Request, res: Response) => {
	try {
		const result = await userServices.getUsers();

		return res.status(200).json({
			success: true,
			message: "Users retrieved successfully",
			data: result.rows,
		});
	} catch (err: any) {
		return res.status(500).json({
			success: false,
			message: err?.message || "Internal Server Error",
		});
	}
};

const updateUser = async (req: AuthRequest, res: Response) => {
	try {
		if (req.user?.role !== "admin" && req.body?.role) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: You cannot change role",
			});
		}

		const { name, email, role, phone } = req.body;

		const result = await userServices.updateUser(name, email, req.params.userId as string, role, phone, req.user?.role);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		return res.status(200).json({
			success: true,
			message: "User updated successfully",
			data: result.rows[0],
		});
	} catch (error: any) {
		return res.status(error.status || 500).json({
			success: false,
			message: error.message,
		});
	}
};

const deleteUser = async (req: Request, res: Response) => {
	try {
		const result = await userServices.deleteUser(req.params.userId as string);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "User deleted successfully",
			data: result.rows[0],
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const userControllers = {
	getUsers,
	updateUser,
	deleteUser,
};
