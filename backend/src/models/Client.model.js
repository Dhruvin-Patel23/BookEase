const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    phone: { type: String, trim: true },
    profileImage: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Client", clientSchema);
