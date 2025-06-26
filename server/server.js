const moment = require("moment");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const PORT = 5000;
//enebale cors for all origins
app.use(cors());
// Enable JSON request body parsing
app.use(express.json());

// Route to get access token from Safaricom
app.get("/mpesa/token", async (req, res) => {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error("Failed to get token", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ M-Pesa server running on http://localhost:${PORT}`);
});

// Route to send STK Push
app.post("/mpesa/stk", async (req, res) => {
  const { phone, amount } = req.body;

  // Get token
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  try {
    // Fetch access token
    const tokenRes = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const access_token = tokenRes.data.access_token;

    // Prepare STK Push data
    const timestamp = moment().format("YYYYMMDDHHmmss");

    const shortcode = process.env.BUSINESS_SHORTCODE;
    const passkey = process.env.PASSKEY;
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
      "base64"
    );

    const stkData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "Luxury Rides",
      TransactionDesc: "Payment for booking",
    };

    // Send STK Push to Safaricom
    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkData,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    res.json({ success: true, response: stkRes.data });
  } catch (err) {
    console.error("❌ STK Push failed", err.response?.data || err.message);
    res.status(500).json({
      error: "STK Push failed",
      details: err.response?.data || err.message,
    });
  }
});
