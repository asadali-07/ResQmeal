const ngoSchema = require("../models/ngo.model");


async function createNgo(req, res) {
    try {
        const { userId, address, location, registrationNumber, capacity } = req.body;
        if (!userId || !address || !location || !registrationNumber || !capacity) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingNgo = await ngoSchema.findOne({ userId });
        if (existingNgo) {
            return res.status(400).json({ message: "Ngo already exists for this user" });
        }
        const newNgo = await ngoSchema.create({
            userId,
            address,
            location,
            registrationNumber,
            capacity
        });
        res.status(201).json({
            message: "Ngo created successfully",
           newNgo
        });
        
    } catch (error) {
        res.status(400).json({ message: error.message });   
    }
}

async function getAllNgos(req, res) {
    try {
        const ngos = await ngoSchema.find();
        res.status(200).json({message: "Ngos retrieved successfully", ngos});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }   
}

async function getNgoByUserId(req, res) {
    try {
        const { userId } = req.params;
        const ngo = await ngoSchema.findOne({ userId });
        if (!ngo) {
            return res.status(404).json({ message: "Ngo not found" });
        }
        res.status(200).json({ message: "Ngo retrieved successfully", ngo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updateNgo(req, res) {
    try {
        const { userId } = req.params;
        const { address, location, registrationNumber, capacity } = req.body;
        const ngo = await ngoSchema.findOne({ userId });
        if (!ngo) {
            return res.status(404).json({ message: "Ngo not found" });
        }
        ngo.address = address || ngo.address;
        ngo.location = location || ngo.location;
        ngo.registrationNumber = registrationNumber || ngo.registrationNumber;
        ngo.capacity = capacity || ngo.capacity;
        const updatedNgo = await ngo.save();
        res.status(200).json({ message: "Ngo updated successfully", updatedNgo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    createNgo, getAllNgos, getNgoByUserId, updateNgo
}