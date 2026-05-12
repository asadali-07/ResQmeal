const express = require('express');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const { createClaim, acceptClaim, verifyPickup, verifyDelivery, cancelClaim }=require('../controllers/claim.controller');


const claimRoutes = express.Router();

claimRoutes.get('/:foodId',createAuthMiddleware(['ngo']), createClaim)
    .patch('/:claimId/accept', createAuthMiddleware(['volunteer']), acceptClaim)
    .patch('/:claimId/pickup', createAuthMiddleware(['volunteer']), verifyPickup)
    .patch('/:claimId/deliver', createAuthMiddleware(['volunteer']), verifyDelivery)
    .patch('/:claimId/cancel', createAuthMiddleware(['ngo', 'volunteer']), cancelClaim);



module.exports = claimRoutes;