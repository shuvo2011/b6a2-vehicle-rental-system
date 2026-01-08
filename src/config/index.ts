import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
	connection_str: process.env.NEON_CONNECTION,
	port: process.env.PORT,
	jwtSecret: process.env.JWT_SECRET,
};

export default config;
