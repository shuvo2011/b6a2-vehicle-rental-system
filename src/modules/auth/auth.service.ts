import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";
import config from "../../config";

const registerUser = async (payload: { name: string; email: string; password: string; phone: string }) => {
	const { name, email, password, phone } = payload;

	const existingUser = await pool.query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);

	if (existingUser.rows.length > 0) {
		throw {
			status: 400,
			message: "User already exists with this email",
		};
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const result = await pool.query(
		`
    INSERT INTO users (name, email, password, phone, role)
    VALUES ($1, $2, $3, $4, 'customer')
    RETURNING id, name, email, phone, role, created_at
    `,
		[name, email.toLowerCase(), hashedPassword, phone]
	);

	return result.rows[0];
};

const loginUser = async (email: string, password: string) => {
	const result = await pool.query(
		`SELECT id, name, email, password, role, phone
     FROM users WHERE email = $1`,
		[email.toLowerCase()]
	);

	if (result.rows.length === 0) {
		throw {
			status: 401,
			message: "Invalid email or password",
		};
	}

	const user = result.rows[0];

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw {
			status: 401,
			message: "Invalid email or password",
		};
	}

	const token = jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		config.jwtSecret as string,
		{
			expiresIn: "7d",
		}
	);

	const { password: _, ...safeUser } = user;

	return {
		token,
		user: safeUser,
	};
};

export const authServices = {
	registerUser,
	loginUser,
};
