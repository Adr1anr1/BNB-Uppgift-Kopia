import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { properties } from "./routes/properties.js";
import { bookings } from "./routes/bookings.js";

const app = new Hono();

// CORS för Vite
app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
    maxAge: 86400,
  })
);

// favicon: svara tomt (slipper felrad i konsolen)
app.get("/favicon.ico", (c) => c.body(null, 204));

// Health
app.get("/", (c) => c.json({ ok: true, service: "bnb-backend (TS + Hono)" }));

// Routes
app.route("/properties", properties);
app.route("/bookings", bookings);

// Fångar oväntade fel så de blir JSON (hjälper felsökning)
app.onError((err, c) => {
  console.error(err);
  const message = err instanceof Error ? err.message : String(err);
  return c.json({ error: message }, 500);
});

const port = Number(process.env.PORT || 8787);
serve({ fetch: app.fetch, port });
console.log(`Server running on http://localhost:${port}`);
