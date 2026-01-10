import express, { Request, Response } from "express";

import config from "./config";
import initDB from "./config/db";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";
import { bookingRoutes } from "./modules/booking/booking.routes";

const app = express();

const port = config.port;

app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // optional

initDB();

app.get("/", (req: Request, res: Response) => {
	res.send("Hello World!");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
		path: req.originalUrl,
	});
});

app.use((err: any, req: Request, res: Response, next: any) => {
	console.error(err);

	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal Server Error",
	});
});

(async () => {
	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
})();
