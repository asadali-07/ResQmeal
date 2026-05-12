const express = require('express');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const {createRestaurant, getAllRestaurants, updateRestaurant, getUserRestaurant, deleteRestaurant} = require('../controllers/restaurant.controller');


const restaurantRouter = express.Router();

restaurantRouter.post('/', createAuthMiddleware(["restaurant"]), createRestaurant)
    .get('/', createAuthMiddleware(["restaurant"]), getUserRestaurant)
    .patch('/', createAuthMiddleware(["restaurant"]), updateRestaurant)
    .delete('/:restaurantId', createAuthMiddleware(["admin"]), deleteRestaurant)
    .get('/all', createAuthMiddleware(["admin"]), getAllRestaurants)

module.exports = restaurantRouter;