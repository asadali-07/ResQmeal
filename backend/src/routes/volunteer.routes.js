const express = require('express');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const { createVolunteer, getAllVolunteers, getUserVolunteer, updateVolunteer, getAllAvailableVolunteers, deleteVolunteer, getVolunteerById, getTopVolunteers } = require('../controllers/volunteer.controller');


const volunteerRouter = express.Router();

volunteerRouter.post('/', createAuthMiddleware(["volunteer"]), createVolunteer)
    .get('/', createAuthMiddleware(["volunteer"]), getUserVolunteer)
    .get('/top',getTopVolunteers)
    .get('/:volunteerId', createAuthMiddleware(["admin",'ngo','restaurant']), getVolunteerById)
    .patch('/', createAuthMiddleware(["volunteer"]), updateVolunteer)
    .get('/available', createAuthMiddleware(["admin"]), getAllAvailableVolunteers)
    .get('/all', createAuthMiddleware(["admin"]), getAllVolunteers)
    .delete('/:volunteerId', createAuthMiddleware(["admin"]), deleteVolunteer)

module.exports = volunteerRouter;