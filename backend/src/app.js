const express = require('express');
const authRouter = require('./routes/auth.routes');
const volunteerRouter = require('./routes/volunteer.routes');
const restaurantRouter = require('./routes/restaurant.routes');
const ngoRouter = require('./routes/ngo.routes');


const app = express();

app.use(express.json());

app.use('/api/auth',authRouter)
app.use('/api/volunteers', volunteerRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/ngos', ngoRouter);


module.exports = app;