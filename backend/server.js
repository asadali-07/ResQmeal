require('dotenv').config();
const connectDB = require('./src/db/db');
const {initSocket} = require('./src/socket/socket')
const expireFoodJob = require('./src/cron/expireFood.job');
const app = require('./src/app');

const http = require('http');
const server = http.createServer(app)

initSocket(server);

connectDB();
expireFoodJob();

server.listen(3000, () => {
  console.log("Server is running on port 3000");
}); 