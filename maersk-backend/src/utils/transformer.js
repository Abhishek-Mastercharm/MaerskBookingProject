export function transformBooking(apiData, booking) {
  const events = apiData.events || [];

  const departure = events.find(
    (e) => e.eventType === "TRANSPORT" && e.transportEventTypeCode === "DEPA",
  );

  const arrival = [...events]
    .reverse()
    .find(
      (e) => e.eventType === "TRANSPORT" && e.transportEventTypeCode === "ARRI",
    );

  const latest = [...events].sort(
    (a, b) =>
      new Date(b.eventCreatedDateTime) - new Date(a.eventCreatedDateTime),
  )[0];

  return {
    bookingNo: booking,
    shippingLine: "MAERSK",
    vesselName: departure?.transportCall?.vessel?.vesselName || "",
    voyageNo: departure?.transportCall?.exportVoyageNumber || "",
    vesselDate: departure?.eventDateTime || "",
    eta: arrival?.eventDateTime || "",
    loadingPort: departure?.transportCall?.location?.locationName || "",
    destinationPort: arrival?.transportCall?.location?.locationName || "",
    shipmentStatus: latest?.eventClassifierCode || "",
    lastUpdated: latest?.eventCreatedDateTime || "",
  };
}
