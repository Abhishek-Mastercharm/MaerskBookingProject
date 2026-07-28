import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import trackingRoutes from "./routes/trackingRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import { getDashboardData, refreshShipmentTracking } from "./services/shipmentService.js";
import { startCronJobs } from "./services/cronService.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", trackingRoutes);
app.use("/api/import", importRoutes);

app.get("/api/dashboard", async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/refresh-all", async (req, res) => {
  try {
    const data = await getDashboardData();
    const bookings = data.map(d => d.bookingNo);
    const updates = await refreshShipmentTracking(bookings);
    res.json({ success: true, updates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Maersk Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start automated background polling
  startCronJobs();
});
