
const { NotFoundError } = require("../core/error.response");
const SensorData = require("../models/sensorData.model");
const alertService = require("../services/alert.service");
const systemService = require("./system.service");
const sensorData = require("../models/sensorData.model")
const checkThresholds = async (data) => {
    if (data.tds > 1000) {
        const message = `Cảm biến đo độ đục vượt ngưỡng! Giá trị: ${data.tds}`;
        // alertService.createAlert({
        //     alert_type: "Cảnh báo độ đục vượt ngưỡng",
        //     message: message,
        //     device: "Cảm biến độ đục"
        // });
        if (data.relay === 1) {
            systemService.turnOnOff(data.relay, message);
        }
    } else if (data.temperature > 60) {
        const message = `Nhiệt độ vượt ngưỡng! Giá trị: ${data.temperature}`
        alertService.createAlert({
            alert_type: "Cảnh báo nhiệt độ nước vượt ngưỡng",
            message: message,
            device: "Cảm biến nhiệt độ"
        });
        if (data.relay === 1) {
            systemService.turnOnOff(data.relay,message);
        }
    } else if (data.flowRate > 2000) {
        const message = `Lưu lượng nước vượt ngưỡng! Giá trị: ${data.flowRate}`
        alertService.createAlert({
            alert_type: "Cảnh báo lưu lượng nước vượt ngưỡng",
            message: message,
            device: "Cảm biến lưu lượng nước"
        });
        if (data.relay === 1) {
            systemService.turnOnOff(data.relay,message);
        }
    }
    const newData = new SensorData(data);
    return await newData.save();
};
class statsService {
    // Subscribe tất cả các device theo deviceCode
    static handleSensorData = async(data) => {
        const parsedData = JSON.parse(data);
        checkThresholds(parsedData)
    };

    static getAllData = async (req) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseFloat(req.query.limit)|| 20;
        const skip = (page - 1) * limit;
        const data = await SensorData.find({}).skip(skip).limit(limit).sort({createAt:-1})
        const total = await SensorData.countDocuments();
        return {
            data:data,
            meta:{
                total,
                page,
                limit,
                totalPages: Math.ceil(total/limit)
            }
        }
    };
}

module.exports = statsService;
