import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.services";

const createVehicle = async (req: Request, res: Response) => {
	const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
	try {
		const result = await vehicleServices.createVehicle(req.body);

		res.status(201).json({
			success: true,
			message: "Vehicle created successfully",
			data: result.rows[0],
		});
	} catch (err: any) {
		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
};

const getVehicles = async (req: Request, res: Response) => {
	try {
		const result = await vehicleServices.getVehicles();

		return res.status(200).json({
			success: true,
			message: "Vehicles retrieved successfully",
			data: result.rows,
		});
	} catch (err: any) {
		return res.status(500).json({
			success: false,
			message: err?.message || "Internal Server Error",
		});
	}
};

const getVehicle = async (req: Request, res: Response) => {
	try {
		const result = await vehicleServices.getVehicle(req.params.vehicleId as string);

		if (!result) {
			return res.status(404).json({
				success: false,
				message: "Vehicle not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Vehicle retrieved successfully",
			data: result.rows[0],
		});
	} catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

const updateVehicle = async (req: Request, res: Response) => {
	const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

	try {
		const result = await vehicleServices.updateVehicle(
			req.params.vehicleId as string,
			vehicle_name,
			type,
			registration_number,
			daily_rent_price,
			availability_status
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Vehicle not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Vehicle updated successfully",
			data: result.rows[0],
		});
	} catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

const deleteVehicle = async (req: Request, res: Response) => {
	try {
		const result = await vehicleServices.deleteVehicle(req.params.vehicleId as string);

		if (result.rows.length === 0) {
			return res.status(404).json({ success: false, message: "Vehicle not found" });
		}

		return res.status(200).json({
			success: true,
			message: "Vehicle deleted successfully",
			data: result.rows[0],
		});
	} catch (error: any) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const vehicleControllers = {
	createVehicle,
	getVehicles,
	getVehicle,
	updateVehicle,
	deleteVehicle,
};
