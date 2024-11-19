// server.js
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const client = require("./config/config.hivemq");
const admin = require("./config/config.firebase");
const cors = require("cors")
require("dotenv").config();
const http = require("http")
const {Server} = require("socket.io")
const app = express();
// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Khởi tạo server và io
require("./dbs/init.database");
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
      origin: "*",  // Hoặc chỉ định cụ thể URL FE để bảo mật hơn
      methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) =>{
    console.log("a user connected", socket.id)
    // socket.emit("serverResponse", { message: "Dữ liệu đã nhận!" });
    socket.on("clientEvent", (data) => {
        console.log("Nhận dữ liệu từ client:", data);
        // Xử lý dữ liệu từ FE hoặc phản hồi lại
    });
})


global._io = io
// Định tuyến
app.use("/api/v1", require("./routers"));

// Xử lý lỗi
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    return res.status(status).json({
        status: 'error',
        code: status,
        stack: err.stack,
        message: err.message || "Internal Server Error"
    });
});

client;
admin;
global.client = client
// Export cả `app`, `server` và `io`
module.exports = { app, server };
