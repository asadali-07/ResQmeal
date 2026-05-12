const claimModel = require('../models/claim.model');
const foodModel = require('../models/food.model');
const volunteerModel = require('../models/volunteer.model');
const restaurantModel = require('../models/restaurant.model');
const jwt = require('jsonwebtoken');

async function createClaim(req, res) {
    const { foodId } = req.params;
    const ngoId = req.user.id;
    try {
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        if (food.status !== 'available') {
            return res.status(400).json({ message: 'Food is not available for claim' });
        }
        const restaurant = await restaurantModel.findById(food.restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        // Find nearby volunteers (within 5km) who are available
        const volunteers = await volunteerModel.find({
            currentLocation: {
                $near: {
                    $geometry: restaurant.location,
                    $maxDistance: 5000, // 5km
                },
            },
            isAvailable: true,
        });
        const claim = new claimModel({
            foodId: food._id,
            ngoId: ngoId,
            restaurantId: restaurant._id
        });
        await claim.save();
        await foodModel.findByIdAndUpdate(foodId, { status: 'pending' });
        return res.status(201).json({ message: 'Claim created successfully', claim, volunteers });
    } catch (error) {
        return res.status(500).json({ message: 'Error occurred while creating claim' });
    }
}

async function acceptClaim(req, res) {
    const { claimId } = req.params;
    const volunteerId = req.user.id;
    try {
        const claim = await claimModel.findById(claimId);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        if (claim.status !== 'pending') {
            return res.status(400).json({ message: 'Claim is not pending' });
        }
        let pickupToken = jwt.sign({ claimId }, process.env.JWT_SECRET, { expiresIn: "2h" });
        let deliveryToken = jwt.sign({ claimId }, process.env.JWT_SECRET, { expiresIn: "4h" });
        claim.pickupToken = pickupToken;
        claim.deliveryToken = deliveryToken;
        claim.volunteerId = volunteerId;
        claim.status = 'accepted';
        claim.acceptedAt = new Date();
        await claim.save();
        return res.status(200).json({ message: 'Claim accepted successfully', claim });
    } catch (error) {
        return res.status(500).json({ message: 'Error occurred while accepting claim' });
    }
}

async function verifyPickup(req, res) {
    const { claimId } = req.params;
    const { pickupToken } = req.body;
    try {
        const claim = await claimModel.findById(claimId);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        if (claim.status !== 'accepted') {
            return res.status(400).json({ message: 'Claim is not accepted' });
        }
        const { claimId: decodedClaimId } = jwt.verify(pickupToken, process.env.JWT_SECRET);
        if (decodedClaimId !== claimId) {
            return res.status(400).json({ message: 'Invalid pickup token' });
        }
        if (claim.pickupVerified) {
            return res.status(400).json({ message: 'Food already picked up' });
        }
        claim.status = 'picked_up';
        claim.pickupVerified = true;
        claim.pickedUpAt = new Date();
        await claim.save();
        await foodModel.findByIdAndUpdate(claim.foodId, { status: 'picked_up' });
        return res.status(200).json({ message: 'Pickup verified successfully', claim });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Pickup token expired' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid pickup token' });
        }

        return res.status(500).json({ message: 'Error occurred while verifying pickup' });
    }
}

async function verifyDelivery(req, res) {
    const { claimId } = req.params;
    const { deliveryToken } = req.body;
    try {
        const claim = await claimModel.findById(claimId);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        if (claim.status !== 'picked_up') {
            return res.status(400).json({ message: 'Claim is not picked up' });
        }
        const { claimId: decodedClaimId } = jwt.verify(deliveryToken, process.env.JWT_SECRET);
        if (decodedClaimId !== claimId) {
            return res.status(400).json({ message: 'Invalid delivery token' });
        }
        if (claim.deliveryVerified) {
            return res.status(400).json({ message: 'Food already delivered' });
        }
        claim.status = 'delivered';
        claim.deliveryVerified = true;
        claim.deliveredAt = new Date();
        await claim.save();
        await foodModel.findByIdAndUpdate(claim.foodId, { status: 'delivered' });
        return res.status(200).json({ message: 'Delivery verified successfully', claim });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Delivery token expired' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid delivery token' });
        }

        return res.status(500).json({ message: 'Error occurred while verifying delivery' });
    }
}

async function cancelClaim(req, res) {
    const { claimId } = req.params;
    try {
        const claim = await claimModel.findById(claimId);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        if (claim.status == 'delivered' || claim.status == 'cancelled') {
            return res.status(400).json({ message: 'Claim is already delivered or cancelled' });
        }
        claim.status = 'cancelled';
        claim.cancelledAt = new Date();
        await claim.save();
        await foodModel.findByIdAndUpdate(claim.foodId, { status: 'available' });
        return res.status(200).json({ message: 'Claim cancelled successfully', claim });
    } catch (error) {
        return res.status(500).json({ message: 'Error occurred while cancelling claim' });
    }
}

module.exports = {
    createClaim,
    acceptClaim,
    verifyPickup,
    verifyDelivery,
    cancelClaim
};