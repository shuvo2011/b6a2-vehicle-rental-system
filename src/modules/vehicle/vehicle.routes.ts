import express from "express";
import { vehicleControllers } from "./vehicle.controller";
import { verifyToken } from "../../middleware/auth";
import { adminOnly } from "../../middleware/adminOnly";

const router = express.Router();

router.post("/", verifyToken, adminOnly, vehicleControllers.createVehicle);

router.get("/", vehicleControllers.getVehicles);

router.get("/:vehicleId", vehicleControllers.getVehicle);

router.put("/:vehicleId", verifyToken, adminOnly, vehicleControllers.updateVehicle);

router.delete("/:vehicleId", verifyToken, adminOnly, vehicleControllers.deleteVehicle);

export const vehicleRoutes = router;
