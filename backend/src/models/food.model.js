const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurants",
        required: true
    },
    name: String,
    description: String,
    quantity: Number,
    expiryTime: Date,
    pickupTime: Date,
    foodImage: String,
    location: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: [Number], // [lng, lat]
    },

    status: {
        type: String,
        enum: ["available", "claimed", "expired"],
        default: "available"
    }


}, { timestamps: true })

foodSchema.index({ location: "2dsphere" });

const foodModel = mongoose.model("foods", foodSchema)

module.exports = foodModel

