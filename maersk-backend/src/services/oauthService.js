import axios from "axios";
import { MAERSK_CONFIG } from "../config/maersk.js";

let cachedToken = null;
let tokenExpiry = null;

export async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await axios.post(
    MAERSK_CONFIG.oauthUrl,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.MAERSK_CLIENT_ID,
      client_secret: process.env.MAERSK_CLIENT_SECRET,
    }),
    {
      headers: {
        "Consumer-Key": process.env.MAERSK_CLIENT_ID,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  cachedToken = response.data.access_token;

  // 55 minutes cache
  tokenExpiry = Date.now() + 55 * 60 * 1000;

  return cachedToken;
}
