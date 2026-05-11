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
    foodImage: {
        url: String,
        thumbnail: String,
        fileId: String
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

    status: {
        type: String,
        enum: ["available", "claimed", "expired"],
        default: "available"
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ngos",
        default: null
    }

}, { timestamps: true })

foodSchema.index({ location: "2dsphere" });

const foodModel = mongoose.model("foods", foodSchema)

module.exports = foodModel

