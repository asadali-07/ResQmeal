const express = require('express');
const { createNgo, getAllNgos, getUserNgo, updateNgo, deleteNgo } = require('../controllers/ngo.controller');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/multer.middleware');

const ngoRouter = express.Router();

ngoRouter.post('/', upload.single('ngoPicture'), createAuthMiddleware(["ngo"]),createNgo)
    .patch('/', upload.single('ngoPicture'), createAuthMiddleware(["ngo"]), updateNgo)
    .get('/',createAuthMiddleware(["ngo"]), getUserNgo)
    .get('/all', createAuthMiddleware(["admin"]), getAllNgos)
    .delete('/:ngoId', createAuthMiddleware(["admin"]), deleteNgo);
    


module.exports = ngoRouter;