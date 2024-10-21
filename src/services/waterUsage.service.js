const { Types } = require("mongoose");
const Device = require("../models/device.model");

class waterUsage{
    static async calculateWaterUsage() {
        // Tìm tất cả các giá trị lưu lượng nước từ cảm biến YF-S201
        const device = await Device.findOne({deviceCode:"YF-S201"}).lean()
        const flowData = await SensorData.find({ device_id: new Types.ObjectId(device._id )}).sort({ createdAt: 1 }).lean();

        if (!flowData.length) {
            return 0; 
        }

        let totalWaterUsage = 0; // Tổng lượng nước sử dụng
        let previousTime = null;

        flowData.forEach((dataPoint) => {
            if (previousTime) {
                const currentTime = new Date(dataPoint.createdAt).getTime();
                const timeDifference = (currentTime - previousTime) / 60000; // Chuyển đổi sang phút

                // Số lượng nước sử dụng = Lưu lượng * thời gian chảy (phút)
                totalWaterUsage += dataPoint.value * timeDifference;
            }
            previousTime = new Date(dataPoint.createdAt).getTime();
        });
        return totalWaterUsage; // Trả về tổng lượng nước đã sử dụng (lít)
    }
}

module.exports = waterUsage