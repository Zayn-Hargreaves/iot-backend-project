const { SuccessResponse } = require("../core/success.response")
const devicesService = require("../services/devices.service")

class deviceController{
    getAllDevice = async(req, res,next)=>{
        new SuccessResponse({
            message:"Get all device success",
            metadata:await devicesService.findAllDevice()
        }).send(res)
    }
    getDeviceById = async(req, res, next)=>{
        new SuccessResponse({
            message:"Get detail device success",
            metadata: await devicesService.findDeviceById(req)
        }).send(res)
    }
}

module.exports = new deviceController()