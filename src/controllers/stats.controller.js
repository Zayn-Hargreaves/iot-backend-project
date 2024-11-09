const { SuccessResponse } = require("../core/success.response")
const statsService = require("../services/stats.service")
const waterUsage = require("../services/waterUsage.service")

class statsController{
    getNewData = async(req, res, next)=>{
        new SuccessResponse({
            message:"get all stats completed",
            metadata: await statsService.getNewdata()
        }).send(res)
    }
    waterUsage = async(req, res, next)=>{
        new SuccessResponse({
            message:"get water Usage",
            metadata: await waterUsage.calculateWaterUsage()
        }).send(res)
    }
    listenMessage = async(req, res, next)=>{
        new SuccessResponse({
            message:"listen for message",
            metadata: await statsService.listenForMessage()
        })
    }
}
module.exports = new statsController()