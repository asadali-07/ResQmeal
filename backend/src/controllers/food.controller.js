const restaurantModel = require("../models/restaurant.model");
const { uploadImage } = require("../services/imagekit.service");


async function createFood(req, res) {
    try {
        const restaurant = await restaurantModel.findOne({ userId: req.user.id });

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        const { name,description,quantity,expiryTime,pickupTime } = req.body;
        if(!name || !description || !quantity || !expiryTime || !pickupTime){
            return res.status(400).json({message : "All fields are required"})
        }

        if(!req.file){
            return res.status(400).json({message : "Food image is required"})
        }

        const foodImage = await uploadImage({ buffer: req.file.buffer });
        const food = await foodModel.create({
            restaurantId: restaurant._id,
            name,
            description,
            quantity,
            expiryTime,
            pickupTime,
            foodImage: foodImage.url,
            location: restaurant.location
        })
        return res.status(201).json({
            message: "Food created successfully",
            food
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error in creating the food",
            error: error.message
        })
    }
}

async function updateFood(req, res) {
    try {
        const restaurant = await restaurantModel.findOne({ userId: req.user.id });
        const { foodId } = req.params;
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        const food = await foodModel.findOne({ _id: foodId, restaurantId: restaurant._id });

        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }
        if(food.status !== "available"){
            return res.status(400).json({message : "Only available food can be updated"})
        }
        const { name,description,quantity,expiryTime,pickupTime } = req.body;

        food.name = name || food.name;
        food.description = description || food.description;
        food.quantity = quantity || food.quantity;
        food.expiryTime = expiryTime || food.expiryTime;
        food.pickupTime = pickupTime || food.pickupTime;
        if(req.file){
            const foodImage = await uploadImage({ buffer: req.file.buffer });
            food.foodImage = foodImage.url;
        }
        await food.save();
        return res.status(200).json({
            message: "Food updated successfully",
            food
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error in updating the food",
            error: error.message
        })
    }
}

async function getAvailableFood(req, res) {
    try {
        const { longitude, latitude } = req.query;
        if (!longitude || !latitude) {
            return res.status(400).json({ message: "Longitude and latitude are required" });
        }  
        const foods = await foodModel.find({
            status: "available",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 5000 // 5 km
                }
            }
        }).populate("restaurantId", "address openingTime closingTime")
        return res.status(200).json({
            message: "Available food fetched successfully",
            foods
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error in fetching available food",
            error: error.message
        })
    }  
}

async function getFoodById(req, res) {
    try {
        const { foodId } = req.params;
        const food = await foodModel.findById(foodId).populate("restaurantId", "address openingTime closingTime")
        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }
        return res.status(200).json({
            message: "Food fetched successfully",
            food
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error in fetching the food",
            error: error.message
        })
    }}

    async function deleteFood(req, res) {
        try {
            const restaurant = await restaurantModel.findOne({ userId: req.user.id });
            const { foodId } = req.params;
            if (!restaurant) {
                return res.status(404).json({ message: "Restaurant not found" });
            }   
            const food = await foodModel.findOne({ _id: foodId, restaurantId: restaurant._id });
            
            if (!food) {
                return res.status(404).json({ message: "Food not found" });
            }
            if(food.status !== "available"){
                return res.status(400).json({message : "Only available food can be deleted"})
            }
            await food.remove();
            return res.status(200).json({
                message: "Food deleted successfully"
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error in deleting the food",
                error: error.message
            })
        }}

module.exports = { createFood, updateFood,getAvailableFood ,getFoodById}