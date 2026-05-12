const volunteerSchema = require('../models/volunteer.model');


async function createVolunteer(req, res) {
    try {
        const {userId,currentLocation,vehicleType} = req.body;

        if (!userId || !currentLocation || !vehicleType) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existingVolunteer = await volunteerSchema.findOne({ userId });

        if (existingVolunteer) {
            return res.status(400).json({ message: "Volunteer already exists for this user" });
        }

        const volunteer = await volunteerSchema.create({
            userId,
            currentLocation,
            vehicleType
        });
        res.status(201).json({ message: "Volunteer created successfully", volunteer });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllVolunteers(req, res) {
    try {
        const volunteers = await volunteerSchema.find();
        res.status(200).json({ message: "Volunteers retrieved successfully", volunteers });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getVolunteerByUserId(req, res) {
    try {
        const { userId } = req.params;
        const volunteer = await volunteerSchema.findOne({ userId });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        res.status(200).json({ message: "Volunteer retrieved successfully", volunteer });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updateVolunteer(req, res) {
    try {
        const { userId } = req.params;
        const { currentLocation, vehicleType,isAvailable } = req.body;
        const volunteer = await volunteerSchema.findOne({ userId });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        volunteer.currentLocation = currentLocation || volunteer.currentLocation;
        volunteer.vehicleType = vehicleType || volunteer.vehicleType;
        volunteer.isAvailable = isAvailable || volunteer.isAvailable;
        const updatedVolunteer = await volunteer.save();
        res.status(200).json({ message: "Volunteer updated successfully", updatedVolunteer });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteVolunteer(req, res) {
    try {
        const { userId } = req.params;
        const volunteer = await volunteerSchema.findOneAndDelete({ userId });
        if (!volunteer) {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        res.status(200).json({ message: "Volunteer deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getAllAvailableVolunteers(req, res) {
    try {
        const volunteers = await volunteerSchema.find({ isAvailable: true });
        res.status(200).json({ message: "Available volunteers retrieved successfully", volunteers });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createVolunteer,
    getAllVolunteers,
    getVolunteerByUserId,
    updateVolunteer,
    getAllAvailableVolunteers,
    deleteVolunteer
}