const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const claimModel = require('../models/claim.model');
const foodModel = require('../models/food.model');
const volunteerModel = require('../models/volunteer.model');
const restaurantModel = require('../models/restaurant.model');

const { sendNotification } = require('../services/notification.service');


async function createClaim(req, res) {

    const { foodId } = req.params;
    const ngoId = req.user.id;

    const session = await mongoose.startSession();

    try {

        let createdClaim = null;
        let restaurant = null;
        let food = null;
        let volunteers = [];

        await session.withTransaction(async () => {

            food = await foodModel.findOneAndUpdate(
                {
                    _id: foodId,
                    status: 'available',
                    expiryTime: { $gt: new Date() } 
                },
                {
                    $set: {
                        status: 'pending'
                    }
                },
                {
                    new: true,
                    session
                }
            );
            if (!food) {
                throw new Error('Food is not available for claim');
            }

            restaurant = await restaurantModel
                .findById(food.restaurantId)
                .session(session);

            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            volunteers = await volunteerModel.find({
                currentLocation: {
                    $near: {
                        $geometry: restaurant.location,
                        $maxDistance: 5000
                    }
                },
                isAvailable: true
            });

            const claim = await claimModel.create(
                [
                    {
                        foodId: food._id,
                        ngoId,
                        restaurantId: restaurant.userId,
                        status: 'pending'
                    }
                ],
                { session }
            );

            createdClaim = claim[0];

        });

        await Promise.all(

            volunteers.map((volunteer) =>

                sendNotification({

                    type: "NEW_PICKUP",

                    senderId: ngoId,

                    receiverId: volunteer.userId.toString(),

                    message: `New food pickup available near you from ${restaurant.restaurantName}`,

                    claimId: createdClaim._id,

                    foodId: food._id,

                    restaurantName: restaurant.restaurantName,

                    pickupAddress: restaurant.address,

                    foodName: food.name,

                    quantity: food.quantity

                })

            )

        );

        await sendNotification({

            type: "CLAIM_CREATED",

            senderId: ngoId,

            receiverId: restaurant.userId.toString(),

            message: `An NGO has claimed your food item ${food.name}`,

            claimId: createdClaim._id,

            foodId: food._id

        });

        return res.status(201).json({

            success: true,

            message: 'Claim created successfully',

            claim: createdClaim,

            volunteers

        });

    } catch (error) {

        console.log(error);

        return res.status(400).json({

            success: false,

            message: error.message || 'Error occurred while creating claim'

        });

    } finally {

        session.endSession();

    }

}

async function getNgoClaimedFoods(req, res) {
    try {
        const ngoId = req.user.id;

        const claims = await claimModel
            .find({ ngoId, status: { $in: ['pending', 'accepted', 'picked_up'] } })
            .sort({ createdAt: -1 })
            .populate({
                path: "foodId",
                populate: {
                    path: "restaurantId",
                    select: "restaurantName address openingTime closingTime location"
                }
            });

        return res.status(200).json({
            success: true,
            message: "Claimed foods fetched successfully",
            claims
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching claimed foods"
        });
    }
}

async function getRestaurantClaims(req, res) {
    try {
        const restaurantId = req.user.id;

        const claims = await claimModel
            .find({
                restaurantId,
                status: { $in: ['accepted', 'picked_up', 'delivered'] }
            })
            .sort({ createdAt: -1 })
            .populate({
                path: "foodId",
                populate: {
                    path: "restaurantId",
                    select: "restaurantName address openingTime closingTime location"
                }
            });

        return res.status(200).json({
            success: true,
            message: "Restaurant claims fetched successfully",
            claims
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching restaurant claims"
        });
    }
}

async function getVolunteerAcceptedClaims(req, res) {
    try {
        const volunteerUserId = req.user.id;
        

        const claims = await claimModel
            .find({
                volunteerId: req.user.id,
                status: { $in: ['accepted', 'picked_up', 'delivered', 'cancelled'] }
            })
            .sort({ acceptedAt: -1, createdAt: -1 })
            .populate({
                path: "foodId",
                populate: {
                    path: "restaurantId",
                    select: "restaurantName address openingTime closingTime location"
                }
            });

        return res.status(200).json({
            success: true,
            message: "Volunteer accepted claims fetched successfully",
            claims
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching volunteer accepted claims"
        });
    }
}

async function getPendingClaims(req, res) {
    try {
        const volunteer = await volunteerModel.findOne({
            userId: req.user.id,
            isAvailable: true
        });

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Available volunteer profile not found"
            });
        }

        const nearbyFoods = await foodModel.find({
            status: "pending",
            expiryTime: { $gt: new Date() },
            location: {
                $near: {
                    $geometry: volunteer.currentLocation,
                    $maxDistance: 5000
                }
            }
        }).select("_id");

        const foodIds = nearbyFoods.map((food) => food._id);

        if (!foodIds.length) {
            return res.status(200).json({
                success: true,
                message: "Pending claims fetched successfully",
                claims: []
            });
        }

        const claims = await claimModel.find({
            status: "pending",
            foodId: { $in: foodIds }
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "foodId",
                populate: {
                    path: "restaurantId",
                    select: "restaurantName address openingTime closingTime location"
                }
            });

        return res.status(200).json({
            success: true,
            message: "Pending claims fetched successfully",
            claims
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching pending claims"
        });
    }
}


async function acceptClaim(req, res) {

    const { claimId } = req.params;

    const volunteerId = req.user.id;

    try {

        const pickupToken = jwt.sign(
            { claimId },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        const deliveryToken = jwt.sign(
            { claimId },
            process.env.JWT_SECRET,
            { expiresIn: "4h" }
        );


        const claim = await claimModel.findOneAndUpdate(

            {
                _id: claimId,
                status: 'pending'
            },

            {
                $set: {
                    volunteerId,
                    pickupToken,
                    deliveryToken,
                    acceptedAt: new Date(),
                    status: 'accepted'
                }
            },

            {
                new: true
            }

        );

        if (!claim) {

            return res.status(400).json({

                success: false,

                message: 'Claim already accepted or unavailable'

            });

        }

        await sendNotification({

            type: "CLAIM_ACCEPTED",

            senderId: volunteerId,

            receiverId: claim.ngoId.toString(),

            message: `Your claim has been accepted by a volunteer`,

            claimId: claim._id,

            foodId: claim.foodId,

            deliveryToken

        });

        await sendNotification({

            type: "CLAIM_ACCEPTED",

            senderId: volunteerId,

            receiverId: claim.restaurantId.toString(),

            message: `Your food item has been accepted by a volunteer`,

            claimId: claim._id,

            foodId: claim.foodId,

            pickupToken

        });

        return res.status(200).json({

            success: true,

            message: 'Claim accepted successfully'

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: 'Error occurred while accepting claim'

        });

    }

}


async function verifyPickup(req, res) {

    const { claimId } = req.params;

    const { pickupToken } = req.body;

    const volunteerId = req.user.id;

    try {

        const decoded = jwt.verify(
            pickupToken,
            process.env.JWT_SECRET
        );

        if (decoded.claimId !== claimId) {

            return res.status(400).json({

                success: false,

                message: 'Invalid pickup token'

            });

        }

        const claim = await claimModel.findOneAndUpdate(

            {
                _id: claimId,
                status: 'accepted',
                pickupVerified: false,
                volunteerId
            },

            {
                $set: {
                    status: 'picked_up',
                    pickupVerified: true,
                    pickedUpAt: new Date()
                }
            },

            {
                new: true
            }

        );

        if (!claim) {

            return res.status(400).json({

                success: false,

                message: 'Pickup already verified or invalid claim'

            });

        }

        await foodModel.findByIdAndUpdate(

            claim.foodId,

            {
                status: 'picked_up'
            }

        );

        await sendNotification({

            type: "PICKUP_VERIFIED",

            senderId: volunteerId,

            receiverId: claim.ngoId.toString(),

            message: `Pickup has been verified`,

            claimId: claim._id,

            foodId: claim.foodId

        });

        return res.status(200).json({

            success: true,

            message: 'Pickup verified successfully'

        });

    } catch (error) {

        console.log(error);

        if (error.name === 'TokenExpiredError') {

            return res.status(400).json({

                success: false,

                message: 'Pickup token expired'

            });

        }

        if (error.name === 'JsonWebTokenError') {

            return res.status(400).json({

                success: false,

                message: 'Invalid pickup token'

            });

        }

        return res.status(500).json({

            success: false,

            message: 'Error occurred while verifying pickup'

        });

    }

}


async function verifyDelivery(req, res) {

    const { claimId } = req.params;

    const { deliveryToken } = req.body;

    const volunteerId = req.user.id;

    try {

        const decoded = jwt.verify(
            deliveryToken,
            process.env.JWT_SECRET
        );

        if (decoded.claimId !== claimId) {

            return res.status(400).json({

                success: false,

                message: 'Invalid delivery token'

            });

        }

        const claim = await claimModel.findOneAndUpdate(

            {
                _id: claimId,
                status: 'picked_up',
                deliveryVerified: false,
                volunteerId
            },

            {
                $set: {
                    status: 'delivered',
                    deliveryVerified: true,
                    deliveredAt: new Date()
                }
            },

            {
                new: true
            }

        );

        if (!claim) {

            return res.status(400).json({

                success: false,

                message: 'Delivery already verified or invalid claim'

            });

        }

        await foodModel.findByIdAndUpdate(

            claim.foodId,

            {
                status: 'delivered'
            }

        );

        await sendNotification({

            type: "DELIVERY_VERIFIED",

            senderId: volunteerId,

            receiverId: claim.ngoId.toString(),

            message: `Delivery has been verified`,

            claimId: claim._id,

            foodId: claim.foodId

        });

        return res.status(200).json({

            success: true,

            message: 'Delivery verified successfully'

        });

    } catch (error) {

        console.log(error);

        if (error.name === 'TokenExpiredError') {

            return res.status(400).json({

                success: false,

                message: 'Delivery token expired'

            });

        }

        if (error.name === 'JsonWebTokenError') {

            return res.status(400).json({

                success: false,

                message: 'Invalid delivery token'

            });

        }

        return res.status(500).json({

            success: false,

            message: 'Error occurred while verifying delivery'

        });

    }

}


async function cancelClaim(req, res) {

    const { claimId } = req.params;

    const ngoId = req.user.id;

    try {

        const claim = await claimModel.findOne({

            _id: claimId,

            ngoId

        });

        if (!claim) {

            return res.status(404).json({

                success: false,

                message: 'Claim not found'

            });

        }

        if (
            claim.status === 'delivered' ||
            claim.status === 'cancelled'
        ) {

            return res.status(400).json({

                success: false,

                message: 'Claim already delivered or cancelled'

            });

        }

        claim.status = 'cancelled';

        claim.cancelledAt = new Date();

        await claim.save();

        await foodModel.findByIdAndUpdate(

            claim.foodId,

            {
                status: 'available'
            }

        );

        if (claim.volunteerId) {

            await sendNotification({

                type: "CLAIM_CANCELLED",

                senderId: ngoId,

                receiverId: claim.volunteerId.toString(),

                message: `Claim has been cancelled by NGO`,

                claimId: claim._id,

                foodId: claim.foodId

            });

        }

        return res.status(200).json({

            success: true,

            message: 'Claim cancelled successfully'

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: 'Error occurred while cancelling claim'

        });

    }

}



module.exports = {

    createClaim,

    getNgoClaimedFoods,

    getRestaurantClaims,

    getVolunteerAcceptedClaims,

    getPendingClaims,

    acceptClaim,

    verifyPickup,

    verifyDelivery,

    cancelClaim

};
