const client = require("../config/config.hivemq");
const { NotFoundError } = require("../core/error.response");
const SensorData = require("../models/sensorData");
const alertService = require("../services/alert.service");
const Device = require("../models/device.model");
const systemService = require("./system.service");

class statsService {
    // Subscribe tất cả các device theo deviceCode
    static subscribeAllDevices = async () => {
        const devices = await Device.find().lean();
        devices.forEach(device => {
            const topic = `/sensor/${device.deviceCode}/data`;  // Tạo topic theo deviceCode
            this.subscribeTopic(topic);
            this.listenForMessage(topic);
        });
    };

    static subscribeTopic = (topic) => {
        client.subscribe(topic, function (err) {
            if (!err) {
                console.log(`Subscribed to topic: ${topic}`);
            } else {
                console.error('Error subscribing to topic:', err);
            }
        });
    };

    static publishMessage = (topic, message) => {
        client.publish(topic, message, function (err) {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log(`Message published to topic: ${topic}`);
            }
        });
    };

    // Lắng nghe tin nhắn từ topic của từng cảm biến
    static listenForMessage = (topic) => {
        client.on('message', async (receivedTopic, message) => {
            if (receivedTopic === topic) {
                const parsedMessage = JSON.parse(message.toString());
                const { deviceCode, value, unit } = parsedMessage;

                // Lưu dữ liệu cảm biến vào MongoDB
                const device = await Device.findOne({ deviceCode }).lean();
                if (!device) {
                    throw new NotFoundError("Cant find device");
                }

                const sensorData = await SensorData.create({
                    device_id: device._id,
                    value,
                    unit
                });

                // Lấy trạng thái relay
                const relay = await Device.findOne({ deviceCode: "RELAY_5V" }).lean();
                const relayData = await SensorData.findOne({ device_id: relay._id }).lean();

                // Kiểm tra ngưỡng của từng cảm biến và tạo cảnh báo nếu cần
                this.checkThresholds(deviceCode, value, device._id, relayData);
                
                console.log(`Data received from ${deviceCode}: ${value}`);
            }
        });
    };

    static checkThresholds = async (deviceCode, value, deviceId, relayData) => {
        // Điều kiện kiểm tra từng loại cảm biến
        if (deviceCode === "ASAIR_AZDM01" && value > 1000) {
            alertService.createAlert({
                alert_type: "Cảnh báo độ đục vượt ngưỡng",
                message: `Cảm biến đo độ đục vượt ngưỡng! Giá trị: ${value}`,
                deviceId: deviceId
            });
            if (relayData.value === 0) {
                systemService.turnOnOff();
            }
        } else if (deviceCode === "EC_SENSOR" && value > 500) {
            alertService.createAlert({
                alert_type: "Cảnh báo nồng độ kim loại vượt ngưỡng",
                message: `Nồng độ kim loại vượt ngưỡng! Giá trị: ${value}`,
                deviceId: deviceId
            });
            if (relayData.value === 0) {
                systemService.turnOnOff();
            }
        } else if (deviceCode === "DS18B20" && value > 60) {
            alertService.createAlert({
                alert_type: "Cảnh báo nhiệt độ nước vượt ngưỡng",
                message: `Nhiệt độ vượt ngưỡng! Giá trị: ${value}`,
                deviceId: deviceId
            });
            if (relayData.value === 0) {
                systemService.turnOnOff();
            }
        } else if (deviceCode === "YF-S201" && value > 2000) {
            alertService.createAlert({
                alert_type: "Cảnh báo lưu lượng nước vượt ngưỡng",
                message: `Lưu lượng nước vượt ngưỡng! Giá trị: ${value}`,
                deviceId: deviceId
            });
            if (relayData.value === 0) {
                systemService.turnOnOff();
            }
        }
    };

    static getNewdata = async () => {
        const devices = await Device.find().lean()
        const sensorDataPromises = devices.map(async (device) => {
            const latestData = await SensorData.findOne({ device_id: device._id })
                .sort({ createdAt: -1 })
                .lean();
            
            return {
                deviceCode: device.deviceCode,
                sensorType: device.sensorType,
                latestData: latestData ? latestData.value : null,
                unit: latestData ? latestData.unit : null
            };
        });
        const sensorData = await Promise.all(sensorDataPromises);
        const relayData = sensorData.find(data => data.deviceCode === "RELAY_5V");

        return {
            sensorData: sensorData, // Dữ liệu của các cảm biến khác
            relayStatus: relayData ? relayData.latestData : null // Trạng thái relay
        };
    };
}

module.exports = statsService;
