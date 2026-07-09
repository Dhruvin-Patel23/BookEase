const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    serviceName: { type: String, trim: true },
    specialization: { type: String, trim: true },
    address: { type: String, trim: true },
    bio: { type: String },
    contactEmail: { type: String, lowercase: true, trim: true },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
