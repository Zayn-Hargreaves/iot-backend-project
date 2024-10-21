const statsService = require("./stats.service");

class systemService{
    static turnOnOff = async()=>{
        const relay = await Device.findOne({deviceCode:"RELAY_5V}"}).lean()
        const relayData = await SensorData.findOne({device_id:relay._id}).lean()
        const topic = "/sensors/RELAY_5V";
        const message = {
            deviceCode :"RELAY_5V",
            value:Math.abs(1-relayData.value)
        }
        statsService.publishMessage(topic,message)
        return await SensorData.findOneAndUpdate({_id:relayData._id},{value:Math.abs(1-relayData.value)})
    }
}

module.exports = systemService