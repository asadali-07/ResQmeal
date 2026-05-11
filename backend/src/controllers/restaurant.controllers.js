const restaurantSchema = require('../schemas/restaurant.schema');

async function createRestaurant(req, res) {
    try {
        const { userId, address, location, foodLicenseNumber, openingTime, closingTime } = req.body;
        if (!userId || !address || !location || !foodLicenseNumber || !openingTime || !closingTime) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingRestaurant = await restaurantSchema.findOne({ userId });
        if (existingRestaurant) {
            return res.status(400).json({ message: "Restaurant already exists for this user" });
        }
        const restaurant = await restaurantSchema.create({ userId, address, location, foodLicenseNumber, openingTime, closingTime });
        res.status(201).json({ message: "Restaurant created successfully", restaurant });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getAllRestaurants(req, res) {
    try {
        const restaurants = await restaurantSchema.find();
        res.status(200).json({ message: "Restaurants retrieved successfully", restaurants });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getRestaurantByUserId(req, res) {
    try {
        const { userId } = req.params;
        const restaurant = await restaurantSchema.findOne({ userId });
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
        const { userId } = req.params;
        const { address, location, foodLicenseNumber, openingTime, closingTime } = req.body;
        const restaurant = await restaurantSchema.findOne({ userId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        restaurant.address = address || restaurant.address;
        restaurant.location = location || restaurant.location;
        restaurant.foodLicenseNumber = foodLicenseNumber || restaurant.foodLicenseNumber;
        restaurant.openingTime = openingTime || restaurant.openingTime;
        restaurant.closingTime = closingTime || restaurant.closingTime;
        await restaurant.save();
        res.status(200).json({ message: "Restaurant updated successfully", restaurant });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { createRestaurant, getAllRestaurants, getRestaurantByUserId, updateRestaurant };