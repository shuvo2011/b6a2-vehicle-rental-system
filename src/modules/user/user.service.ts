import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

const createUser = async (payload: Record<string, unknown>) => {
	const { name, email, password, role, phone } = payload;

	const hashedPassword = await bcrypt.hash(password as string, 10);

	const result = await pool.query(
		`INSERT INTO users(name, email, password, role, phone) VALUES($1, $2, $3, $4, $5) RETURNING *`,
		[name, email, hashedPassword, role, phone]
	);

	return result;
};

const getUsers = async () => {
	const result = await pool.query("SELECT * FROM users");
	return result;
};

const getUser = async (id: string) => {
	const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

	return result;
};

const updateUser = async (name: string, email: string, id: string, role: string, phone: string) => {
	const result = await pool.query(
		"UPDATE users SET name = $1, email = $2, role = $3, phone = $4 WHERE id = $5 RETURNING *",
		[name, email, role, phone, id]
	);

	return result;
};

const deleteUser = async (id: string) => {
	const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);

	return result;
};

export const userServices = {
	createUser,
	getUsers,
	getUser,
	updateUser,
	deleteUser,
};
