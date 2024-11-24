const SensorData = require("../models/sensorData.model");
const topic = '/sensor/control';
class systemService {
    static turnOnOff = async (data, message) => {
        const newData = data
        global.client.publish(topic, data, function (err) {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log(`Message published to topic: ${topic} with data: ${newData}`);
            }
        });
        global._io.emit("switch system", { topic, message });
    }
}

module.exports = systemService