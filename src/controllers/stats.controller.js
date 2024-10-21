const { SuccessResponse } = require("../core/success.response")
const statsService = require("../services/stats.service")

class statsController{
    getNewData = async(req, res, next)=>{
        new SuccessResponse({
            message:"get all stats completed",
            metadata: await statsService.getNewdata()
        }).send(res)
    }
}
module.exports = new statsController()