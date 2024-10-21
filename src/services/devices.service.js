const { Types } = require("mongoose");
const { INTERNAL_SERVER_ERROR, NotFoundError } = require("../core/error.response");
const Device = require("../models/device.model")

class devicesService{
    static findAllDevice = async()=>{
        const devices = await Device.find().lean(); 
        console.log(devices)
        if(!devices){
            throw new INTERNAL_SERVER_ERROR("Error fetching Data")
        }
        return devices
    }
    static findDeviceById = async(req)=>{
        const {deviceId} = req.params
        const deviceDetail = await Device.findOne({_id:new Types.ObjectId(deviceId)}).lean()
        if(!deviceDetail){
            throw new NotFoundError("Device not found")
        }
        return deviceDetail
    }
}

module.exports = devicesService
