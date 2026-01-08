import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userServices } from "./user.service";

const createUser = async (req: Request, res: Response) => {
	const { name, email, password, role, phone } = req.body;
	try {
		const result = await userServices.createUser(req.body);

		res.status(201).json({
			success: true,
			message: "Data inserted successfully",
			data: result.rows[0],
		});
	} catch (err: any) {
		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
};

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

const getUser = async (req: Request, res: Response) => {
	try {
		const result = await userServices.getUser(req.params.id as string);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "User retrieved successfully",
			data: result.rows[0],
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

const updateUser = async (req: Request, res: Response) => {
	const { name, email, role, phone } = req.body;
	try {
		const result = await userServices.updateUser(name, email, req.params.id as string, role, phone);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		} else {
			return res.status(200).json({
				success: true,
				message: "User updated successfully",
				data: result.rows[0],
			});
		}
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

const deleteUser = async (req: Request, res: Response) => {
	try {
		const result = await userServices.deleteUser(req.params.id as string);

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
	createUser,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};
