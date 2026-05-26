const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRouter = require('./routes/auth.routes');
const volunteerRouter = require('./routes/volunteer.routes');
const restaurantRouter = require('./routes/restaurant.routes');
const ngoRouter = require('./routes/ngo.routes');
const foodRouter = require('./routes/food.routes');
const messageRouter = require('./routes/message.routes');
const claimRouter = require('./routes/cliam.routes');

const app = express();

/// ================= For detection of real user ip not the proxy or load balancer =================
app.set("trust proxy", 1);

// ================= RATE LIMITERS =================

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: 'Too many login attempts. Try again later.',
    },
});


// ================= MIDDLEWARE =================

app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));


// Apply global limiter
app.use('/api', apiLimiter);

// Apply strict auth limiter
app.use('/api/auth', authLimiter);


// ================= ROUTES =================

app.use('/api/auth', authRouter);

app.use('/api/volunteers', volunteerRouter);

app.use('/api/restaurants', restaurantRouter);

app.use('/api/ngos', ngoRouter);

app.use('/api/food', foodRouter);

app.use('/api/messages', messageRouter);

app.use('/api/claims', claimRouter);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the Food Rescue API',
    });
});


module.exports = app;