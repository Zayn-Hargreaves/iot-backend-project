const statsService = require("../services/stats.service")

const hivemqMiddleware =async (req, res, next)=>{
    try {
        await statsService.subscribeAllDevices();
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }

}
module.exports = {hivemqMiddleware}