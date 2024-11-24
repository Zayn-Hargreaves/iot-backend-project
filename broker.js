const mqtt = require("mqtt");
const readline = require("readline");

// Cấu hình MQTT Broker
const mqttServer = "mqtt://192.168.43.204"; // Địa chỉ MQTT Broker
const mqttPort = 2403; // Port của MQTT Broker
const sensorDataTopic = "/sensor/data"; // Topic nhận dữ liệu cảm biến
const controlTopic = "/sensor/control"; // Topic điều khiển máy bơm
const autoControlTopic = "/sensor/auto"; // Topic điều khiển chế độ tự động/thủ công

// Kết nối tới MQTT Broker
const client = mqtt.connect(mqttServer, {
  port: mqttPort,
});

let isAutoMode = true; // Trạng thái mặc định là chế độ tự động

client.on("connect", () => {
  console.log("Đã kết nối tới MQTT Broker");

  // Subscribe tới các topic cần thiết
  client.subscribe([sensorDataTopic, autoControlTopic], (err) => {
    if (!err) {
      console.log(`Đã subscribe tới các topic: ${sensorDataTopic}, ${autoControlTopic}`);
    } else {
      console.error("Lỗi khi subscribe tới các topic:", err);
    }
  });
});

// Lắng nghe dữ liệu từ MQTT
client.on("message", (topic, message) => {
  try {
    const msg = message.toString();

    // Xử lý dữ liệu cảm biến từ ESP32
    if (topic === sensorDataTopic) {
      const data = JSON.parse(msg);
      console.log(`Dữ liệu nhận được từ ${topic}:`);
      console.log(`- Nhiệt độ: ${data.temperature}°C`);
      console.log(`- TDS: ${data.tds} ppm`);
      console.log(`- Lưu lượng nước: ${data.flowRate} L/min`);
    }

    // Xử lý thay đổi chế độ (tự động/thủ công)
    if (topic === autoControlTopic) {
      if (msg === "on") {
        isAutoMode = true;
        console.log("Chế độ đã chuyển sang TỰ ĐỘNG.");
      } else if (msg === "off") {
        isAutoMode = false;
        console.log("Chế độ đã chuyển sang THỦ CÔNG.");
      } else {
        console.warn("Message không hợp lệ trên topic /sensor/auto.");
      }
    }
  } catch (err) {
    console.error("Lỗi khi xử lý message MQTT:", err);
  }
});

// Gửi lệnh điều khiển từ bàn phím
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Nhập lệnh ("on" / "off" để bật/tắt máy bơm, "auto on/off" để đổi chế độ): ',
});

rl.prompt();

rl.on("line", (line) => {
  const input = line.trim().toLowerCase();

  if (input === "on" || input === "off") {
    if (!isAutoMode) {
      // Gửi lệnh bật/tắt máy bơm nếu đang ở chế độ thủ công
      client.publish(controlTopic, input, {}, (err) => {
        if (!err) {
          console.log(`Lệnh "${input}" đã được gửi tới topic: ${controlTopic}`);
        } else {
          console.error("Lỗi khi gửi lệnh MQTT:", err);
        }
      });
    } else {
        console.log("Hiện đang ở chế độ tự động, không thể gửi lệnh bật/tắt máy bơm.");
    }
  } else if (input === "aon") {
    // Gửi lệnh chuyển sang chế độ tự động
    client.publish(autoControlTopic, "on", {}, (err) => {
      if (!err) {
        console.log("Lệnh chuyển sang chế độ TỰ ĐỘNG đã được gửi.");
      } else {
        console.error("Lỗi khi gửi lệnh MQTT:", err);
      }
    });
  } else if (input === "aoff") {
    // Gửi lệnh chuyển sang chế độ thủ công
    client.publish(autoControlTopic, "off", {}, (err) => {
      if (!err) {
        console.log("Lệnh chuyển sang chế độ THỦ CÔNG đã được gửi.");
      } else {
        console.error("Lỗi khi gửi lệnh MQTT:", err);
      }
    });
  } else {
    console.log('Lệnh không hợp lệ. Vui lòng nhập "on", "off", "aon", hoặc "aoff".');
  }

  rl.prompt();
});

// Xử lý sự kiện kết nối bị mất
client.on("error", (err) => {
  console.error("Lỗi kết nối MQTT:", err);
});

client.on("offline", () => {
  console.warn("MQTT Broker đã offline.");
});

client.on("close", () => {
  console.warn("Kết nối tới MQTT Broker đã bị đóng.");
})