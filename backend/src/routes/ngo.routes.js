const express = require('express');
const { createNgo, getAllNgos, getUserNgo, updateNgo, deleteNgo } = require('../controllers/ngo.controller');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');

const ngoRouter = express.Router();

ngoRouter.post('/', createAuthMiddleware(["ngo"]),createNgo)
    .get('/', createAuthMiddleware(["ngo"]), getUserNgo)
    .patch('/', createAuthMiddleware(["ngo"]), updateNgo)
    .get('/all', createAuthMiddleware(["admin"]), getAllNgos)
    .delete('/:ngoId', createAuthMiddleware(["admin"]), deleteNgo);
    


module.exports = ngoRouter;