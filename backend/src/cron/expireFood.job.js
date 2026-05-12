const cron = require('node-cron');
const foodModel = require('../models/food.model');

const expireFoodJob = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const result = await foodModel.updateMany(
                {
                    expiryTime: { $lt: new Date() },
                    status: { $nin: ['delivered', 'expired'] }
                },
                {
                    $set: { status: 'expired' }
                }
            );

            console.log(`Expired foods updated: ${result.modifiedCount}`);
        } catch (error) {
            console.log('Cron Job Error:', error.message);
        }
    });
};

module.exports = expireFoodJob;