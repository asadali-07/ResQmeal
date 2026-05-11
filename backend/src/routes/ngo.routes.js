const express = require('express');
const { createNgo, getAllNgos, getNgoByUserId, updateNgo } = require('../controllers/ngo.controllers');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');

const ngoRouter = express.Router();

ngoRouter.post('/', createAuthMiddleware(["ngo"]),createNgo)
    .get('/', createAuthMiddleware(["admin"]), getAllNgos)
    .get('/:userId', createAuthMiddleware(["ngo"]), getNgoByUserId)
    .patch('/:userId', createAuthMiddleware(["ngo"]), updateNgo);
    



module.exports = ngoRouter;