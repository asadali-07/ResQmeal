const express = require('express');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');
const {createRestaurant, getAllRestaurants, updateRestaurant, getUserRestaurant, deleteRestaurant} = require('../controllers/restaurant.controller');


const restaurantRouter = express.Router();

restaurantRouter.post('/', upload.single('restaurantPicture'), createAuthMiddleware(["restaurant"]), createRestaurant)
    .get('/', createAuthMiddleware(["restaurant"]), getUserRestaurant)
    .patch('/', upload.single('restaurantPicture'), createAuthMiddleware(["restaurant"]), updateRestaurant)
    .delete('/:restaurantId', createAuthMiddleware(["admin"]), deleteRestaurant)
    .get('/all', createAuthMiddleware(["admin"]), getAllRestaurants);

module.exports = restaurantRouter;