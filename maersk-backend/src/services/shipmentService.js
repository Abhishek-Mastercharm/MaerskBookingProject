import prisma from "../config/prismaClient.js";
import { fetchBookingEvents } from "./trackingService.js";
import { transformBooking } from "../utils/transformer.js";
import { sendShipmentUpdateAlert } from "./telegramService.js";

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

      const hasStatusChanged = !currentTracking || currentTracking.shipmentStatus !== transformed.shipmentStatus;
      
      const newEta = transformed.eta ? new Date(transformed.eta).getTime() : null;
      const oldEta = currentTracking?.eta ? currentTracking.eta.getTime() : null;

      const newVesselDate = transformed.vesselDate ? new Date(transformed.vesselDate).getTime() : null;
      const oldVesselDate = currentTracking?.vesselDate ? currentTracking.vesselDate.getTime() : null;

      const hasDataChanged = !currentTracking || 
        hasStatusChanged ||
        currentTracking.shippingLine !== transformed.shippingLine ||
        currentTracking.vesselName !== transformed.vesselName ||
        currentTracking.voyageNo !== transformed.voyageNo ||
        oldVesselDate !== newVesselDate ||
        oldEta !== newEta ||
        currentTracking.loadingPort !== transformed.loadingPort ||
        currentTracking.destinationPort !== transformed.destinationPort;

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
      if (hasStatusChanged) {
        await prisma.trackingHistory.create({
          data: {
            bookingNo: booking,
            status: transformed.shipmentStatus || "UNKNOWN",
          }
        });
      }

      // If ANY relevant data changed, send Telegram alert
      if (hasDataChanged) {
        // Fetch invoice number for the notification
        const invoiceRecord = await prisma.invoice.findUnique({
          where: { bookingNo: booking }
        });

        const statusTransition = currentTracking 
          ? (hasStatusChanged ? `${currentTracking.shipmentStatus} → ${transformed.shipmentStatus}` : transformed.shipmentStatus)
          : `New: ${transformed.shipmentStatus}`;

        // Send Telegram Notification
        await sendShipmentUpdateAlert({
          invoice: invoiceRecord ? invoiceRecord.invoiceNo : "N/A",
          booking: booking,
          shippingLine: transformed.shippingLine,
          vessel: transformed.vesselName,
          voyage: transformed.voyageNo,
          status: statusTransition,
          loadingPort: transformed.loadingPort,
          destination: transformed.destinationPort,
          eta: transformed.eta ? new Date(transformed.eta).toLocaleDateString('en-GB') : "N/A",
          updated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
