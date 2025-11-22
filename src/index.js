require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./db");
const usersRoutes = require("./routes/users");
const conversationsRoutes = require("./routes/conversations");
const webhookRoutes = require("./routes/webhooks");

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- Middlewares --------------------
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// -------------------- Health Check --------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend running fine!" });
});

// -------------------- Database Connect --------------------
connectDB();

// -------------------- API Routes --------------------
app.use("/users", usersRoutes);
app.use("/conversations", conversationsRoutes);

// ⭐ Most IMPORTANT — META webhook route
app.use("/webhooks", webhookRoutes);

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on port ${PORT}`);
  console.log(`📄 Project brief path: ${process.env.PROJECT_BRIEF_PATH || "not set"}`);
});
