const ImageKit = require("imagekit");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();



const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'test_public',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'test_private',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/demo',
});

async function uploadImage({ buffer, folder = '/ResQmeal' }) {
    const res = await imagekit.upload({
        file: buffer,
        fileName: uuidv4(),
        folder,
    });
    return {
        url: res.url,
        thumbnail: res.thumbnailUrl || res.url,
        fileId: res.fileId,
    };
}

async function deleteImage(fileId) {
    try {

        const response = await imagekit.deleteFile(fileId);

        console.log("Image deleted successfully");
        console.log(response);

    } catch (error) {

        console.log("Error deleting image:", error);

    }
}

module.exports = { uploadImage, deleteImage };