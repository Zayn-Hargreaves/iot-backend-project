const SensorData = require("../models/sensorData.model");
const topic = 'sensor/data';
class systemService {
    static turnOnOff = async (data, message) => {
        data = Math.abs(1 - data);
        const newData = `Relay: ${data}`
        global.client.publish(topic, JSON.stringify(newData), function (err) {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log(`Message published to topic: ${topic}`);
            }
        });
        global._io.emit("switch system", { topic, message });
    }
}

module.exports = systemService