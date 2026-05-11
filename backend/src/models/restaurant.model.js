const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
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

  foodLicenseNumber: String,
  openingTime: String,
  closingTime: String,

  totalDonations: {
    type: Number,
    default: 0,
  },
});

restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);