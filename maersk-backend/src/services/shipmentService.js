import prisma from "../config/prismaClient.js";
import { fetchBookingEvents } from "./trackingService.js";
import { transformBooking } from "../utils/transformer.js";

// Save uploaded invoice/booking mappings
export async function saveImportedBookings(records) {
  const results = {
    added: 0,
    updated: 0,
    errors: [],
  };

  for (const record of records) {
    try {
      // Upsert invoice
      await prisma.invoice.upsert({
        where: { bookingNo: record.bookingNo },
        update: { invoiceNo: record.invoiceNo },
        create: {
          invoiceNo: record.invoiceNo,
          bookingNo: record.bookingNo,
        },
      });

      // Upsert initial tracking shell if not exists
      await prisma.shipmentTracking.upsert({
        where: { bookingNo: record.bookingNo },
        update: {},
        create: {
          bookingNo: record.bookingNo,
          shipmentStatus: "PENDING",
        },
      });

      results.added++;
    } catch (error) {
      results.errors.push(`Failed for booking ${record.bookingNo}: ${error.message}`);
    }
  }

  return results;
}

// Refresh tracking for a list of bookings
export async function refreshShipmentTracking(bookingNumbers) {
  const updates = [];

  for (const booking of bookingNumbers) {
    try {
      const data = await fetchBookingEvents(booking);
      const transformed = transformBooking(data, booking);

      // Check current status in DB
      const currentTracking = await prisma.shipmentTracking.findUnique({
        where: { bookingNo: booking }
      });

      // Update tracking record
      const updatedRecord = await prisma.shipmentTracking.upsert({
        where: { bookingNo: booking },
        update: {
          shippingLine: transformed.shippingLine,
          vesselName: transformed.vesselName,
          voyageNo: transformed.voyageNo,
          vesselDate: transformed.vesselDate ? new Date(transformed.vesselDate) : null,
          eta: transformed.eta ? new Date(transformed.eta) : null,
          loadingPort: transformed.loadingPort,
          destinationPort: transformed.destinationPort,
          shipmentStatus: transformed.shipmentStatus,
          lastUpdated: new Date()
        },
        create: {
          bookingNo: booking,
          shippingLine: transformed.shippingLine,
          vesselName: transformed.vesselName,
          voyageNo: transformed.voyageNo,
          vesselDate: transformed.vesselDate ? new Date(transformed.vesselDate) : null,
          eta: transformed.eta ? new Date(transformed.eta) : null,
          loadingPort: transformed.loadingPort,
          destinationPort: transformed.destinationPort,
          shipmentStatus: transformed.shipmentStatus,
        }
      });

      // If status changed or it's a new record, add to History
      if (!currentTracking || currentTracking.shipmentStatus !== transformed.shipmentStatus) {
        await prisma.trackingHistory.create({
          data: {
            bookingNo: booking,
            status: transformed.shipmentStatus || "UNKNOWN",
          }
        });
      }

      updates.push({ booking, success: true, status: transformed.shipmentStatus });

    } catch (error) {
      console.error(`Error refreshing booking ${booking}:`, error.message);
      updates.push({ booking, success: false, error: error.message });
    }
  }

  return updates;
}

export async function getDashboardData() {
  const trackingData = await prisma.shipmentTracking.findMany({
    include: {
      // Need a join on Invoice. bookingNo is unique in both, but Prisma doesn't do non-relation joins cleanly without relations.
      // We didn't setup a relation in schema, so we query both.
    }
  });

  const invoices = await prisma.invoice.findMany();
  
  // Join them in memory
  const joinedData = trackingData.map(track => {
    const inv = invoices.find(i => i.bookingNo === track.bookingNo);
    return {
      ...track,
      invoiceNo: inv ? inv.invoiceNo : null
    };
  });

  return joinedData;
}
