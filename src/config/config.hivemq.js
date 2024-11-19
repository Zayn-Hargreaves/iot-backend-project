const mqtt = require('mqtt');
const statsService = require('../services/stats.service');

// Thông tin MQTT broker
const brokerUrl = 'mqtt://localhost:2403'; // Thay 'localhost' bằng IP của broker nếu cần
const topic = 'sensor/data'; // Topic bạn muốn subscribe

// Kết nối tới broker
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Đã kết nối tới MQTT broker.');

  // Subscribe tới topic
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Lỗi khi subscribe:', err);
    } else {
      console.log(`Đã subscribe tới topic: ${topic}`);
    }
  });
});

// Lắng nghe dữ liệu từ topic
client.on('message', (topic, message) => {
  console.log(`Dữ liệu nhận được từ topic "${topic}": ${message.toString()}`);
  const data = message.toString()
  if (global._io) {
    global._io.emit("mqttData", { topic, data });
    statsService.handleSensorData(data)
  }
});

// Xử lý lỗi kết nối
client.on('error', (err) => {
  console.error('Lỗi MQTT:', err);
});
// end test
module.exports = client