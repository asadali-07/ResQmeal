const express = require('express');
const { createAuthMiddleware } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const {  createFood, updateFood, getAvailableFood, getFoodById,deleteFood } = require('../controllers/food.controller');


const foodRouter = express.Router();

foodRouter.post('/',createAuthMiddleware(["restaurant"]),upload.single("foodImage"),createFood)
    .patch('/:foodId',createAuthMiddleware(["restaurant"]),upload.single("foodImage"),updateFood)
    .get('/available',createAuthMiddleware(["ngo", "volunteer"]),getAvailableFood)
    .get('/:foodId',createAuthMiddleware(["ngo", "volunteer"]),getFoodById)
    .delete('/:foodId',createAuthMiddleware(["restaurant"]),deleteFood);

module.exports = foodRouter;