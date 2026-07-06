const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
    profileImage: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Client", clientSchema);
