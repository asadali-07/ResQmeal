const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  ngoName: {
    type: String,
    required: true,
  },

  ngoDescription: String,

  ngoPicture: {
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

  registrationNumber: String,

  capacity: Number,

  totalMealsReceived: {
    type: Number,
    default: 0,
  },
});

ngoSchema.index({ location: "2dsphere" });

const ngoModel = mongoose.model('ngos',ngoSchema)

module.exports = ngoModel