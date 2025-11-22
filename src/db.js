const mongoose = require('mongoose');

module.exports = function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❗ MONGO_URI not found in .env file");
    process.exit(1);
  }

  mongoose.connect(uri)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
};
