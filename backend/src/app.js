const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

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

module.exports = app;
