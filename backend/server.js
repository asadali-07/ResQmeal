require('dotenv').config();
const connectDB = require('./src/db/db');
const {server} = require('./src/socket/socket')


connectDB()

server.listen(3000, () => {
  console.log("Server is running on port 3000");
}); 