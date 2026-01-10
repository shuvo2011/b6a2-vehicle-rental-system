import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, unknown>) => {
	const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

	const result = await pool.query(
		`INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1, $2, $3, $4, $5) RETURNING *`,
		[vehicle_name, type, registration_number, daily_rent_price, availability_status]
	);

	return result;
};

const getVehicles = async () => {
	const result = await pool.query("SELECT * FROM vehicles");
	return result;
};

const getVehicle = async (id: string) => {
	const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
	return result;
};

const updateVehicle = async (
	id: string,
	vehicle_name: string,
	type: string,
	registration_number: string,
	daily_rent_price: number,
	availability_status: string
) => {
	const result = await pool.query(
		"UPDATE vehicles SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5 WHERE id = $6 RETURNING *",
		[vehicle_name, type, registration_number, daily_rent_price, availability_status, id]
	);

	return result;
};

const deleteVehicle = async (id: string) => {
	const active = await pool.query(`SELECT 1 FROM bookings WHERE vehicle_id = $1 AND status = 'active' LIMIT 1`, [id]);

	if (active.rows.length > 0) {
		throw { status: 400, message: "Cannot delete vehicle with active bookings" };
	}

	return pool.query("DELETE FROM vehicles WHERE id = $1 RETURNING *", [id]);
};

export const vehicleServices = {
	createVehicle,
	getVehicles,
	getVehicle,
	updateVehicle,
	deleteVehicle,
};
