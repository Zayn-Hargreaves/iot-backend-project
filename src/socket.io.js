// socket.js
const http = require("http");
const SocketIO = require("socket.io");
const app = require("./app");  // import app từ `app.js`

const server = http.createServer(app);
const io = SocketIO(server);

module.exports = { io, server };
