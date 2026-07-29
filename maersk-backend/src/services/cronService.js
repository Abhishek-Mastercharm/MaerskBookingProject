import cron from "node-cron";
import { getDashboardData, refreshShipmentTracking } from "./shipmentService.js";

// Run this job every 5 minutes for testing. You can change this back to every few hours later.
// Format: minute hour dayOfMonth month dayOfWeek
// "*/5 * * * *" means "every 5 minutes"
export const startCronJobs = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ [CRON] Starting automatic shipment tracking refresh...");
    try {
      // 1. Get all active bookings from the database
      const data = await getDashboardData();
      
      // Filter out bookings that are already delivered to save API calls, 
      // but if you don't have a final status like 'DELIVERED', we just check all of them.
      const activeBookings = data
        .filter(d => d.shipmentStatus !== 'DELIVERED') // Assuming 'DELIVERED' is the final state
        .map(d => d.bookingNo);

      if (activeBookings.length === 0) {
        console.log("⏰ [CRON] No active bookings to update.");
        return;
      }

      console.log(`⏰ [CRON] Updating ${activeBookings.length} bookings...`);
      
      // 2. Call the refresh service
      // (This will automatically send Telegram notifications if any data has changed)
      const updates = await refreshShipmentTracking(activeBookings);
      
      const successCount = updates.filter(u => u.success).length;
      console.log(`⏰ [CRON] Finished refresh. Successfully updated: ${successCount}/${updates.length}`);
    } catch (error) {
      console.error("⏰ [CRON] Error during automatic refresh:", error.message);
    }
  });

  console.log("✅ Background CRON jobs initialized. Will poll Maersk automatically.");
};
