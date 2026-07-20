import express from "express";
import { getBookings } from "../controllers/trackingController.js";

const router = express.Router();

router.get("/bookings", getBookings);

export default router;
    