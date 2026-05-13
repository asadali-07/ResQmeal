const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  restaurantName: {
    type: String,
    required: true,
  },

  restaurantDescription: String,

  restaurantPicture: {
    url: String,
    thumbnail: String,
    fileId: String
  },

  address: {
    street: String,
    area: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: "India",
    },
    formattedAddress: String,
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
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

const restaurantModel = mongoose.model("restaurants", restaurantSchema)

module.exports = restaurantModel