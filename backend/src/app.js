const express = require('express');
const cookieParser = require('cookie-parser');
const cors= require('cors');
const authRouter = require('./routes/auth.routes');
const volunteerRouter = require('./routes/volunteer.routes');
const restaurantRouter = require('./routes/restaurant.routes');
const ngoRouter = require('./routes/ngo.routes');
const foodRouter = require('./routes/food.routes');
const messageRouter = require('./routes/message.routes');
const claimRouter = require('./routes/cliam.routes');


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Update with your frontend URL
    credentials: true,
})); 

app.use('/api/auth',authRouter)
app.use('/api/volunteers', volunteerRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/ngos', ngoRouter);
app.use('/api/food',foodRouter)
app.use('/api/messages',messageRouter)
app.use('/api/claims',claimRouter)


module.exports = app;