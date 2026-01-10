import express from "express";
import { verifyToken } from "../../middleware/auth";
import { bookingControllers } from "./booking.controller";

const router = express.Router();

router.post("/", verifyToken, bookingControllers.createBooking);
router.get("/", verifyToken, bookingControllers.getBookings);
router.put("/:bookingId", verifyToken, bookingControllers.updateBookingStatus);

export const bookingRoutes = router;
