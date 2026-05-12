const restaurantModel = require('../models/restaurant.model');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function createRestaurant(req, res) {
    try {
        const { address, foodLicenseNumber, openingTime, closingTime } = req.body;
        if(req.user.isVerified === false){
            return res.status(403).json({ message: "Please verify your email address before creating a restaurant" });
        }
        if (!address || !foodLicenseNumber || !openingTime || !closingTime) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingRestaurant = await restaurantModel.findOne({ userId: req.user.id });
        if (existingRestaurant) {
            return res.status(400).json({ message: "Restaurant already exists for this user" });
        }
        const formattedAddress = `${address.street}, ${address.area}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`;
        let response = await geocodingClient
            .forwardGeocode({
                query: formattedAddress,
                limit: 1,
            })
            .send();
        const restaurant = await restaurantModel.create({
            userId: req.user.id,
            address: { ...address, formattedAddress },
            location: response.body.features[0].geometry,
            foodLicenseNumber,
            openingTime,
            closingTime
        });
        res.status(201).json({ message: "Restaurant created successfully", restaurant });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getAllRestaurants(req, res) {
    try {
        const restaurants = await restaurantModel.find();
        res.status(200).json({ message: "Restaurants retrieved successfully", restaurants });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getUserRestaurant(req, res) {
    try {
        const restaurant = await restaurantModel.findOne({ userId: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.status(200).json({ message: "Restaurant retrieved successfully", restaurant });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updateRestaurant(req, res) {
    try {
        const { address, foodLicenseNumber, openingTime, closingTime } = req.body;
        const restaurant = await restaurantModel.findOne({ userId: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        if (address) {
            const formattedAddress = `${address.street}, ${address.area}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`;
            let response = await geocodingClient
                .forwardGeocode({
                    query: formattedAddress,
                    limit: 1,
                })
                .send();
            restaurant.address = { ...address, formattedAddress };
            restaurant.location = response.body.features[0].geometry;
        }
        restaurant.foodLicenseNumber = foodLicenseNumber || restaurant.foodLicenseNumber;
        restaurant.openingTime = openingTime || restaurant.openingTime;
        restaurant.closingTime = closingTime || restaurant.closingTime;
        await restaurant.save();
        res.status(200).json({ message: "Restaurant updated successfully", restaurant });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteRestaurant(req, res) {
    try {
        const { restaurantId } = req.params;
        const restaurant = await restaurantModel.findOneAndDelete({ _id: restaurantId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.status(200).json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { createRestaurant, getAllRestaurants, getUserRestaurant, updateRestaurant, deleteRestaurant };