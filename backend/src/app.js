const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ message: "BookEase API is running successfully!", status: "ok" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


// routes will be mounted here as we build each page
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/provider", require("./routes/provider.routes"));
app.use("/api/client", require("./routes/client.routes"));
app.use("/api/booking", require("./routes/booking.routes"));

module.exports = app;
