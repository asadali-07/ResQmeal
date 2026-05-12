const express = require('express');
const {createAuthMiddleware} = require('../middlewares/auth.middleware');
const { createVolunteer, getAllVolunteers, getVolunteerByUserId, updateVolunteer, getAllAvailableVolunteers, deleteVolunteer } = require('../controllers/volunteer.controller');


const volunteerRouter = express.Router();

volunteerRouter.post('/', createAuthMiddleware(["volunteer"]), createVolunteer)
    .get('/', createAuthMiddleware(["admin"]), getAllVolunteers)
    .get('/:userId', createAuthMiddleware(["volunteer"]), getVolunteerByUserId)
    .patch('/:userId', createAuthMiddleware(["volunteer"]), updateVolunteer)
    .get('/available', createAuthMiddleware(["admin","ngo", "restaurant"]), getAllAvailableVolunteers)
    .delete('/:userId', createAuthMiddleware(["admin"]), deleteVolunteer);

module.exports = volunteerRouter;