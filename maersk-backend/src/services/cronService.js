import cron from "node-cron";
import { getDashboardData, refreshShipmentTracking } from "./shipmentService.js";

// Run this job every 4 hours. You can change the cron expression based on how often Maersk updates.
// Format: minute hour dayOfMonth month dayOfWeek
// "0 */4 * * *" means "at minute 0 past every 4th hour"
export const startCronJobs = () => {
  cron.schedule("0 */4 * * *", async () => {
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
