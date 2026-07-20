import axios from "axios";
import { getAccessToken } from "./oauthService.js";
import { MAERSK_CONFIG } from "../config/maersk.js";

export async function fetchBookingEvents(booking) {
  const token = await getAccessToken();

  const response = await axios.get(MAERSK_CONFIG.trackingUrl, {
    params: {
      carrierBookingReference: booking,
    },
    headers: {
      "Consumer-Key": process.env.MAERSK_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
}
