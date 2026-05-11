const express = require('express');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const {createRestaurant, getAllRestaurants, getRestaurantByUserId, updateRestaurant} = require('../controllers/restaurant.controller');


const restaurantRouter = express.Router();

restaurantRouter.post('/', createAuthMiddleware(["restaurant"]), createRestaurant)
    .get('/', createAuthMiddleware(["admin"]), getAllRestaurants)
    .get('/:userId', createAuthMiddleware(["restaurant"]), getRestaurantByUserId)
    .patch('/:userId', createAuthMiddleware(["restaurant"]), updateRestaurant);

module.exports = restaurantRouter;