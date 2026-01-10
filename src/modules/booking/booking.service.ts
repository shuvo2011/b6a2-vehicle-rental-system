import { pool } from "../../config/db";

const calcDays = (start: Date, end: Date) => {
	const ms = end.getTime() - start.getTime();
	return Math.ceil(ms / (1000 * 60 * 60 * 24));
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

	const vehicleRes = await pool.query(
		`SELECT id, vehicle_name, daily_rent_price, availability_status
     FROM vehicles WHERE id = $1`,
		[vehicle_id]
	);

	if (vehicleRes.rows.length === 0) throw { status: 404, message: "Vehicle not found" };

	const vehicle = vehicleRes.rows[0];

	if (vehicle.availability_status !== "available") {
		throw { status: 400, message: "Vehicle is not available" };
	}

	const days = calcDays(start, end);
	const total_price = Number(vehicle.daily_rent_price) * days;

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

		return {
			...bookingRes.rows[0],
			vehicle: {
				vehicle_name: vehicle.vehicle_name,
				daily_rent_price: Number(vehicle.daily_rent_price),
			},
		};
	} catch (e) {
		await pool.query("ROLLBACK");
		throw { status: 500, message: "Booking creation failed" };
	}
};

const getBookings = async (payload: { role: string; userId: number }) => {
	const { role, userId } = payload;

	if (role === "admin") {
		const res = await pool.query(
			`
      SELECT
        b.id, b.customer_id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
        u.name AS customer_name, u.email AS customer_email,
        v.vehicle_name, v.registration_number
      FROM bookings b
      JOIN users u ON u.id = b.customer_id
      JOIN vehicles v ON v.id = b.vehicle_id
      ORDER BY b.id DESC
      `
		);

		return res.rows.map((r) => ({
			id: r.id,
			customer_id: r.customer_id,
			vehicle_id: r.vehicle_id,
			rent_start_date: r.rent_start_date,
			rent_end_date: r.rent_end_date,
			total_price: Number(r.total_price),
			status: r.status,
			customer: {
				name: r.customer_name,
				email: r.customer_email,
			},
			vehicle: {
				vehicle_name: r.vehicle_name,
				registration_number: r.registration_number,
			},
		}));
	}

	const res = await pool.query(
		`
    SELECT
      b.id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
      v.vehicle_name, v.registration_number, v.type
    FROM bookings b
    JOIN vehicles v ON v.id = b.vehicle_id
    WHERE b.customer_id = $1
    ORDER BY b.id DESC
    `,
		[userId]
	);

	return res.rows.map((r) => ({
		id: r.id,
		vehicle_id: r.vehicle_id,
		rent_start_date: r.rent_start_date,
		rent_end_date: r.rent_end_date,
		total_price: Number(r.total_price),
		status: r.status,
		vehicle: {
			vehicle_name: r.vehicle_name,
			registration_number: r.registration_number,
			type: r.type,
		},
	}));
};

const updateBookingStatus = async (payload: {
	bookingId: string;
	status: "cancelled" | "returned";
	role: string;
	userId: number;
}) => {
	const { bookingId, status, role, userId } = payload;

	const bookingRes = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
	if (bookingRes.rows.length === 0) throw { status: 404, message: "Booking not found" };

	const booking = bookingRes.rows[0];

	if (status === "cancelled") {
		if (role !== "admin") {
			if (String(booking.customer_id) !== String(userId)) {
				throw { status: 403, message: "Forbidden" };
			}

			const now = new Date();
			const start = new Date(booking.rent_start_date);
			if (now >= start) {
				throw { status: 400, message: "Cannot cancel after rent_start_date" };
			}
		}

		try {
			await pool.query("BEGIN");

			const updated = await pool.query(
				`UPDATE bookings SET status = 'cancelled' WHERE id = $1
         RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
				[bookingId]
			);

			await pool.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [booking.vehicle_id]);

			await pool.query("COMMIT");
			return {
				...updated.rows[0],
				total_price: Number(updated.rows[0].total_price),
			};
		} catch (e) {
			await pool.query("ROLLBACK");
			throw { status: 500, message: "Cancel failed" };
		}
	}

	if (status === "returned") {
		if (role !== "admin") throw { status: 403, message: "Forbidden: Admin access only" };

		try {
			await pool.query("BEGIN");

			const updated = await pool.query(
				`UPDATE bookings SET status = 'returned' WHERE id = $1
         RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
				[bookingId]
			);

			await pool.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [booking.vehicle_id]);

			await pool.query("COMMIT");

			return {
				...updated.rows[0],
				total_price: Number(updated.rows[0].total_price),
				vehicle: { availability_status: "available" },
			};
		} catch (e) {
			await pool.query("ROLLBACK");
			throw { status: 500, message: "Return update failed" };
		}
	}

	throw { status: 400, message: "Invalid status" };
};

export const bookingServices = {
	createBooking,
	getBookings,
	updateBookingStatus,
};
