// socket.js
const http = require("http");
const SocketIO = require("socket.io");
const app = require("./app");  // import app từ `app.js`

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
      origin: "*",  // Cho phép tất cả các nguồn kết nối đến server
      methods: ["GET", "POST"]  // Các phương thức HTTP được phép
    }
});

module.exports = { io, server };
