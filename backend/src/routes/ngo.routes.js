const express = require('express');
const { createNgo, getAllNgos, getUserNgo, updateNgo, deleteNgo, getNgoById, getTopNgos } = require('../controllers/ngo.controller');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

const ngoRouter = express.Router();

ngoRouter.post('/', upload.single('ngoPicture'), createAuthMiddleware(["ngo"]),createNgo)
    .patch('/', upload.single('ngoPicture'), createAuthMiddleware(["ngo"]), updateNgo)
    .get('/',createAuthMiddleware(["ngo"]), getUserNgo)
    .get('/top',getTopNgos)
    .get('/all', createAuthMiddleware(["admin"]), getAllNgos)
    .get('/:ngoId', createAuthMiddleware(["volunteer","admin","restaurant"]), getNgoById)
    .delete('/:ngoId', createAuthMiddleware(["admin"]), deleteNgo);
    


module.exports = ngoRouter;