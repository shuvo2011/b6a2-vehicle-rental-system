import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

const getUsers = async () => {
	const result = await pool.query("SELECT * FROM users");
	return result;
};

const updateUser = async (name: string, email: string, userId: string, role: string, phone: string) => {
	const result = await pool.query(
		"UPDATE users SET name = $1, email = $2, role = $3, phone = $4 WHERE id = $5 RETURNING *",
		[name, email, role, phone, userId]
	);

	return result;
};

const deleteUser = async (userId: string) => {
	const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [userId]);

	return result;
};

export const userServices = {
	getUsers,
	updateUser,
	deleteUser,
};
