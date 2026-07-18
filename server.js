const express = require("express");
const axios = require("axios");

const app = express();

const PORT = 3000;

// ======= YOUR VALUES =======

const CLIENT_ID = "f6A52ezksiUeje1oqQfzbz9pikl98DR6";

const CLIENT_SECRET = "sk9DimIhGEUmuQB6";

const BOOKING = "274244174";
// const BOOKING = "272467121";

// ===========================

// single booking function test
// app.get("/test", async (req, res) => {
//   try {
//     // STEP 1
//     // Get Access Token

//     const tokenResponse = await axios.post(
//       "https://api.maersk.com/customer-identity/oauth/v2/access_token",

//       new URLSearchParams({
//         grant_type: "client_credentials",

//         client_id: CLIENT_ID,

//         client_secret: CLIENT_SECRET,
//       }),

//       {
//         headers: {
//           "Consumer-Key": CLIENT_ID,

//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       },
//     );

//     const token = tokenResponse.data.access_token;

//     // STEP 2
//     // Call Track & Trace

//     const eventResponse = await axios.get(
//       "https://api.maersk.com/track-and-trace-private/events",

//       {
//         params: {
//           carrierBookingReference: BOOKING,
//         },

//         headers: {
//           "Consumer-Key": CLIENT_ID,

//           Authorization: "Bearer " + token,

//           Accept: "application/json",
//         },
//       },
//     );

//     res.json(eventResponse.data);
//   } catch (err) {
//     console.log(err.response?.data);

//     console.log(err.message);

//     res.status(500).json({
//       error: err.response?.data || err.message,
//     });
//   }
// });

// Multiple booking function test at once
app.get("/events", async (req, res) => {
  try {0
    // ===============================
    // STEP 1 : GET ACCESS TOKEN
    // ===============================

    const tokenResponse = await axios.post(
      "https://api.maersk.com/customer-identity/oauth/v2/access_token",

      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),

      {
        headers: {
          "Consumer-Key": CLIENT_ID,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const token = tokenResponse.data.access_token;

    // ===============================
    // STEP 2 : GET BOOKINGS
    // ===============================

    const bookingString = req.query.booking;

    if (!bookingString) {
      return res.status(400).json({
        success: false,
        message: "Please provide booking numbers.",
      });
    }

    const bookings = bookingString
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    // ===============================
    // STEP 3 : CALL MAERSK
    // ===============================

    const results = [];

    for (const booking of bookings) {
      try {
        const response = await axios.get(
          "https://api.maersk.com/track-and-trace-private/events",

          {
            params: {
              carrierBookingReference: booking,
            },

            headers: {
              "Consumer-Key": CLIENT_ID,
              Authorization: "Bearer " + token,
              Accept: "application/json",
            },
          },
        );

        results.push({
          booking: booking,
          success: true,
          data: response.data,
        });
      } catch (error) {
        results.push({
          booking: booking,
          success: false,
          error: error.response?.data || error.message,
        });
      }
    }

    // ===============================

    res.json({
      total: bookings.length,
      results: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server Running");

  console.log("http://localhost:3000/test");
});
