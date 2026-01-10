import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

const getUsers = async () => {
	const result = await pool.query("SELECT * FROM users");
	return result;
};

const updateUser = async (
	name: string,
	email: string,
	userId: string,
	role: string,
	phone: string,
	actorRole?: string
) => {
	if (actorRole !== "admin") {
		const result = await pool.query(
			"UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, name, email, phone, role",
			[name, email?.toLowerCase?.() ?? email, phone, userId]
		);
		return result;
	}

	const result = await pool.query(
		"UPDATE users SET name = $1, email = $2, role = $3, phone = $4 WHERE id = $5 RETURNING id, name, email, phone, role",
		[name, email?.toLowerCase?.() ?? email, role, phone, userId]
	);
	return result;
};

const deleteUser = async (userId: string) => {
	const active = await pool.query(`SELECT 1 FROM bookings WHERE customer_id = $1 AND status = 'active' LIMIT 1`, [
		userId,
	]);

	if (active.rows.length > 0) {
		throw { status: 400, message: "Cannot delete user with active bookings" };
	}

	return pool.query("DELETE FROM users WHERE id = $1 RETURNING id, name, email, phone, role", [userId]);
};

export const userServices = {
	getUsers,
	updateUser,
	deleteUser,
};
