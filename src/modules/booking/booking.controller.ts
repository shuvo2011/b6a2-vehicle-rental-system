import { Response } from "express";
import { bookingServices } from "./booking.service";
import { AuthRequest } from "../../middleware/auth";

const createBooking = async (req: AuthRequest, res: Response) => {
	try {
		const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

		if (!vehicle_id || !rent_start_date || !rent_end_date) {
			return res.status(400).json({
				success: false,
				message: "vehicle_id, rent_start_date, rent_end_date are required",
				errors: "Validation error",
			});
		}

		const role = req.user?.role;
		const tokenUserId = req.user?.userId;

		let finalCustomerId: number | null = null;

		if (role === "admin") {
			if (!customer_id) {
				return res.status(400).json({
					success: false,
					message: "customer_id is required for admin booking",
					errors: "Validation error",
				});
			}
			finalCustomerId = Number(customer_id);
		} else {
			if (!tokenUserId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
					errors: "Token missing/invalid",
				});
			}
			finalCustomerId = Number(tokenUserId);
		}

		const booking = await bookingServices.createBooking({
			customer_id: finalCustomerId,
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
			message: err.message || "Internal Server Error",
			errors: err.message || "Internal Server Error",
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

		const message = role === "admin" ? "Bookings retrieved successfully" : "Your bookings retrieved successfully";

		return res.status(200).json({
			success: true,
			message,
			data,
		});
	} catch (err: any) {
		return res.status(err.status || 500).json({
			success: false,
			message: err.message || "Internal Server Error",
			errors: err.message || "Internal Server Error",
		});
	}
};

const updateBooking = async (req: AuthRequest, res: Response) => {
	try {
		const bookingId = req.params.bookingId;

		if (!bookingId) {
			return res.status(400).json({
				success: false,
				message: "bookingId is required",
				errors: "Validation error",
			});
		}

		const { status } = req.body;

		if (!status || !["cancelled", "returned"].includes(status)) {
			return res.status(400).json({
				success: false,
				message: "status must be 'cancelled' or 'returned'",
				errors: "Validation error",
			});
		}

		const role = String(req.user?.role);
		const userId = Number(req.user?.userId);

		const updated = await bookingServices.updateBookingStatus({
			bookingId,
			status,
			role,
			userId,
		});

		const message =
			status === "cancelled"
				? "Booking cancelled successfully"
				: "Booking marked as returned. Vehicle is now available";

		return res.status(200).json({
			success: true,
			message,
			data: updated,
		});
	} catch (err: any) {
		return res.status(err.status || 500).json({
			success: false,
			message: err.message || "Internal Server Error",
			errors: err.message || "Internal Server Error",
		});
	}
};

export const bookingControllers = {
	createBooking,
	getBookings,
	updateBooking,
};
