import { pool } from "../../config/db";

const calcDays = (start: Date, end: Date) => {
	const diff = end.getTime() - start.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24)); // days
};

const createBooking = async (payload: {
	customer_id: number;
	vehicle_id: number;
	rent_start_date: string;
	rent_end_date: string;
}) => {
	const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

	const start = new Date(rent_start_date);
	const end = new Date(rent_end_date);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		throw { status: 400, message: "Invalid date format" };
	}
	if (end <= start) {
		throw { status: 400, message: "rent_end_date must be after rent_start_date" };
	}

	// 1) check vehicle exists + availability + get daily price
	const vehicleRes = await pool.query(
		`SELECT id, daily_rent_price, availability_status
     FROM vehicles
     WHERE id = $1`,
		[vehicle_id]
	);

	if (vehicleRes.rows.length === 0) {
		throw { status: 404, message: "Vehicle not found" };
	}

	const vehicle = vehicleRes.rows[0];

	if (vehicle.availability_status !== "available") {
		throw { status: 400, message: "Vehicle is not available" };
	}

	// 2) calculate total_price
	const days = calcDays(start, end);
	const total_price = Number(vehicle.daily_rent_price) * days;

	if (total_price <= 0) {
		throw { status: 400, message: "total_price must be positive" };
	}

	// 3) transaction: create booking + update vehicle status
	try {
		await pool.query("BEGIN");

		const bookingRes = await pool.query(
			`
      INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
      `,
			[customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
		);

		await pool.query(`UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`, [vehicle_id]);

		await pool.query("COMMIT");
		return bookingRes.rows[0];
	} catch (e) {
		await pool.query("ROLLBACK");
		throw { status: 500, message: "Booking creation failed" };
	}
};

const getBookings = async (payload: { role?: string; userId?: number }) => {
	const { role, userId } = payload;

	if (role === "admin") {
		const res = await pool.query(
			`SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
       FROM bookings
       ORDER BY id DESC`
		);
		return res.rows;
	}

	const res = await pool.query(
		`SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
     FROM bookings
     WHERE customer_id = $1
     ORDER BY id DESC`,
		[userId]
	);

	return res.rows;
};

const updateBookingStatus = async (payload: {
	bookingId: string;
	action: "cancel" | "returned";
	role?: string;
	userId?: number;
}) => {
	const { bookingId, action, role, userId } = payload;

	const bookingRes = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);

	if (bookingRes.rows.length === 0) {
		throw { status: 404, message: "Booking not found" };
	}

	const booking = bookingRes.rows[0];

	// CUSTOMER: cancel (before rent_start_date only)
	if (action === "cancel") {
		if (role !== "admin") {
			if (String(booking.customer_id) !== String(userId)) {
				throw { status: 403, message: "Forbidden: You can cancel only your own booking" };
			}

			const now = new Date();
			const start = new Date(booking.rent_start_date);

			if (now >= start) {
				throw { status: 400, message: "Cannot cancel after rent_start_date" };
			}
		}

		try {
			await pool.query("BEGIN");

			const updated = await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`, [
				bookingId,
			]);

			await pool.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [booking.vehicle_id]);

			await pool.query("COMMIT");
			return updated.rows[0];
		} catch (e) {
			await pool.query("ROLLBACK");
			throw { status: 500, message: "Cancel failed" };
		}
	}

	// ADMIN: returned
	if (action === "returned") {
		if (role !== "admin") {
			throw { status: 403, message: "Forbidden: Admin access only" };
		}

		try {
			await pool.query("BEGIN");

			const updated = await pool.query(`UPDATE bookings SET status = 'returned' WHERE id = $1 RETURNING *`, [
				bookingId,
			]);

			await pool.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [booking.vehicle_id]);

			await pool.query("COMMIT");
			return updated.rows[0];
		} catch (e) {
			await pool.query("ROLLBACK");
			throw { status: 500, message: "Return update failed" };
		}
	}

	throw { status: 400, message: "Invalid action. Use cancel or returned" };
};

export const bookingServices = {
	createBooking,
	getBookings,
	updateBookingStatus,
};
