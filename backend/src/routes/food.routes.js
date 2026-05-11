const express = require('express');
const { createAuthMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const {  createFood, updateFood, getAvailableFood, getFoodById } = require('../controllers/food.controller');


const foodRouter = express.Router();

foodRouter.post('/create',createAuthMiddleware(["restaurant"]),upload.single("foodImage"),createFood)
foodRouter.post('/update/:foodId',createAuthMiddleware(["restaurant"]),upload.single("foodImage"),updateFood)
foodRouter.get('/available',createAuthMiddleware(["ngo", "volunteer"]),getAvailableFood)
foodRouter.get('/:foodId',createAuthMiddleware(["ngo", "volunteer"]),getFoodById)

module.exports = foodRouter;