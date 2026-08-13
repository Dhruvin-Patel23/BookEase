const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(
  cors({
    origin: "http://localhost:5173", // your Vite dev server
    credentials: true,
  }),
);
// routes will be mounted here as we build each page
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/provider", require("./routes/provider.routes"));
app.use("/api/client", require("./routes/client.routes"));
app.use("/api/booking", require("./routes/booking.routes"));

module.exports = app;
