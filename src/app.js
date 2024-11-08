const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet")
const compression = require("compression");
const client = require("./config/config.hivemq");
const admin = require("./config/config.firebase");
const SocketIO = require("socket.io")
const { hivemqMiddleware } = require("./middleware/hivemq.middleware");
const http = require("http")
require("dotenv").config()

const app = express();
//init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}))
const server = http.createServer(app)
const io = SocketIO(server)
// init db
require("./dbs/init.database")
app.use(hivemqMiddleware)
app.use("/api/v1", require("./routers"))
app.use((req,res,next)=>{
    const err = new Error('Not Found');
    err.status = 404,
    next(err)
})
app.use((err, req, res, next) => {
    const status = err.status || 500;
    return res.status(status).json({
        status: 'error',
        code: status,
        stack: err.stack,  // Sửa từ error.stack thành err.stack
        message: err.message || "Internal Server Error"
    });
});

client;
admin;


module.exports = {app,server, io};