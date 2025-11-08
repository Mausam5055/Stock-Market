import "dotenv/config";
import express from "express";
import WebSocket from "ws";

const app = express();
const PORT = process.env.PORT || 4000;

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const NEXTJS_BASE_URL = process.env.NEXTJS_BASE_URL;

// Start Express
app.listen(PORT, () => {
  console.log(`Worker running on port ${PORT}`);
});

// Connect to Finnhub
const ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("close", (code, reason) => {
  console.log(`WebSocket closed: ${code} - ${reason}`);
});

ws.on("open", async () => {
  console.log("Connected to Finnhub");

  // Fetch alerts from Next.js app
  const res = await fetch(`${NEXTJS_BASE_URL}/api/alerts`);
  const alerts = await res.json();

  // Subscribe to all symbols in alerts
  alerts.forEach((alert) => {
    ws.send(JSON.stringify({ type: "subscribe", symbol: alert.symbol }));
  });
});

ws.on("message", async (data) => {
  const parsed = JSON.parse(data.toString());
  if (parsed.type !== "trade") return;

  const trade = parsed.data?.[0];
  if (!trade) return;

  const { s: symbol, p: price } = trade;
  console.log(`Price received: ${symbol} ${price}`);

  // Get alerts for this symbol
  const res = await fetch(`${NEXTJS_BASE_URL}/api/alerts`);
  const alerts = await res.json();
  const symbolAlerts = alerts.filter((a) => a.symbol === symbol);

  // Check and send alerts that should trigger
  for (const alert of symbolAlerts) {
    const { userEmail, company, alertType, alertName, threshold, lastSent } = alert;
    
    // If lastSent is not set, it means the alert has never been sent
    if (lastSent && new Date(lastSent).toDateString() === new Date().toDateString()) {
      continue; // Skip if alert was already sent today
    }

    // Check if alert should trigger
    let shouldTrigger = false;
    if (alertType === "upper" && price > threshold) shouldTrigger = true;
    if (alertType === "lower" && price < threshold) shouldTrigger = true;

    if (shouldTrigger) {
      await fetch(`${NEXTJS_BASE_URL}/api/trigger-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          userEmail,
          company,
          alertType,
          alertName,
          thresholdValue: threshold,
          currentValue: price
        }),
      });
    }
  }
});