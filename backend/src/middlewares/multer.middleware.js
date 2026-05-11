const multer = require("multer");

 const upload = multer({memoryStorage: multer.memoryStorage()}) 
 
 module.exports = {
     upload
 }