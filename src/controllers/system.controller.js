const { SuccessResponse } = require("../core/success.response")
const systemService = require("../services/system.service")

class systemController{
    turnOnOff = async(req, res, next)=>{
        new SuccessResponse({
            message:"Turn on/off successfully",
            metadata: await systemService.turnOnOff(req.body.relay,"Chuyển chế độ công tắc")
        }).send(res)
    }
}

module.exports = new systemController()