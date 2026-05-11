const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  address: Object,

  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [Number],
  },

  registrationNumber: String,

  capacity: Number,

  totalMealsReceived: {
    type: Number,
    default: 0,
  },
});

ngoSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("NGO", ngoSchema);