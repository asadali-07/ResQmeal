const ngoModel = require("../models/ngo.model");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
const {uploadImage} = require('../services/imagekit.service');


async function createNgo(req, res) {
    try {
        const { address, registrationNumber, capacity,ngoName,ngoDescription } = req.body;
        if(req.user.isVerified === false){
            return res.status(403).json({ message: "Please verify your email address before creating an ngo" });
        }
        if (!address || !registrationNumber || !capacity || !ngoName || !ngoDescription) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingNgo = await ngoModel.findOne({ userId: req.user.id });
        if (existingNgo) {
            return res.status(400).json({ message: "Ngo already exists for this user" });
        }
        let ngoPicture=null;
        if(req.file){
           ngoPicture = await uploadImage({ buffer: req.file.buffer });
        }
        const formattedAddress = `${address.street}, ${address.area}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`;
        let response = await geocodingClient
            .forwardGeocode({
                query: formattedAddress,
                limit: 1,
            })
            .send();
        const newNgo = await ngoModel.create({
            userId: req.user.id,
            address: { ...address, formattedAddress },
            location: response.body.features[0].geometry,
            registrationNumber,
            capacity,
            ngoName,
            ngoDescription,
            ngoPicture
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
        const ngos = await ngoModel.find();
        res.status(200).json({ message: "Ngos retrieved successfully", ngos });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getUserNgo(req, res) {
    try {
        const ngo = await ngoModel.findOne({ userId: req.user.id });
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
        const { address,registrationNumber, capacity, ngoName, ngoDescription } = req.body;
        const ngo = await ngoModel.findOne({ userId: req.user.id });
        if (!ngo) {
            return res.status(404).json({ message: "Ngo not found" });
        }
        if(address){
            const formattedAddress = `${address.street}, ${address.area}, ${address.landmark}, ${address.city}, ${address.state}, ${address.pincode}, ${address.country}`;
            let response = await geocodingClient
                .forwardGeocode({
                    query: formattedAddress,
                    limit: 1,
                })
                .send();
            ngo.address = { ...address, formattedAddress };
            ngo.location = response.body.features[0].geometry;
        }
        ngo.registrationNumber = registrationNumber || ngo.registrationNumber;
        ngo.capacity = capacity || ngo.capacity;
        ngo.ngoName = ngoName || ngo.ngoName;
        ngo.ngoDescription = ngoDescription || ngo.ngoDescription;
        if(req.file){
            ngo.ngoPicture = await uploadImage({ buffer: req.file.buffer });
        }
        const updatedNgo = await ngo.save();
        res.status(200).json({ message: "Ngo updated successfully", updatedNgo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteNgo(req, res) {
    try {
        const { ngoId } = req.params;
        const ngo = await ngoModel.findOneAndDelete({ _id: ngoId });
        if (!ngo) {
            return res.status(404).json({ message: "Ngo not found" });
        }
        res.status(200).json({ message: "Ngo deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}   

module.exports = {
    createNgo, getAllNgos, getUserNgo, updateNgo, deleteNgo
}