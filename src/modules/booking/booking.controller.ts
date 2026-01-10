import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { bookingServices } from "./booking.service";

const createBooking = async (req: AuthRequest, res: Response) => {
	try {
		const { vehicle_id, rent_start_date, rent_end_date } = req.body;

		if (!vehicle_id || !rent_start_date || !rent_end_date) {
			return res.status(400).json({
				success: false,
				message: "vehicle_id, rent_start_date, rent_end_date are required",
			});
		}

		const customer_id = req.user?.userId;
		if (!customer_id) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const booking = await bookingServices.createBooking({
			customer_id: Number(customer_id),
			vehicle_id: Number(vehicle_id),
			rent_start_date,
			rent_end_date,
		});

		return res.status(201).json({
			success: true,
			message: "Booking created successfully",
			data: booking,
		});
	} catch (err: any) {
		return res.status(err.status || 500).json({
			success: false,
			message: err.message,
		});
	}
};

const getBookings = async (req: AuthRequest, res: Response) => {
	try {
		const role = req.user?.role;
		const userId = req.user?.userId;

		const data = await bookingServices.getBookings({
			role: String(role),
			userId: Number(userId),
		});

		return res.status(200).json({
			success: true,
			message: "Bookings retrieved successfully",
			data,
		});
	} catch (err: any) {
		return res.status(err.status || 500).json({
			success: false,
			message: err.message,
		});
	}
};

const updateBookingStatus = async (req: AuthRequest, res: Response) => {
	try {
		const bookingId = req.params.bookingId;
		if (!bookingId) {
			return res.status(400).json({
				success: false,
				message: "bookingId is required in params",
			});
		}
		const { action } = req.body;

		if (!action) {
			return res.status(400).json({
				success: false,
				message: "action is required (cancel/returned)",
			});
		}

		const updated = await bookingServices.updateBookingStatus({
			bookingId,
			action,
			role: String(req.user?.role),
			userId: Number(req.user?.userId),
		});

		return res.status(200).json({
			success: true,
			message: "Booking updated successfully",
			data: updated,
		});
	} catch (err: any) {
		return res.status(err.status || 500).json({
			success: false,
			message: err.message,
		});
	}
};

export const bookingControllers = {
	createBooking,
	getBookings,
	updateBookingStatus,
};
