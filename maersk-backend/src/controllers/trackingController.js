import { fetchBookingEvents } from "../services/trackingService.js";
import { transformBooking } from "../utils/transformer.js";

export async function getBookings(req, res) {
  try {
    const bookingString = req.query.booking;

    if (!bookingString) {
      return res.status(400).json({
        success: false,
        message: "booking query required",
      });
    }

    const bookings = bookingString
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const results = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const data = await fetchBookingEvents(booking);

          return {
            booking,
            success: true,
            row: transformBooking(data, booking),
          };
        } catch (error) {
          return {
            booking,
            success: false,
            error: error.response?.data || error.message,
          };
        }
      }),
    );

    res.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
