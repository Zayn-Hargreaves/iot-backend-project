const mqtt = require('mqtt');

const options = {
    host: '901fd4961989456385b5b176217f0ce3.s1.eu.hivemq.cloud', // Thay Cluster URL
    port: 8883, // Port MQTT
    protocol: 'mqtts', // Sử dụng MQTT qua TLS
    username: 'hivemq.webclient.1729244738458', // Thay bằng username HiveMQ của bạn
    password: 'ih1PU90m;5?*aAHk%OTp'  // Thay bằng password HiveMQ của bạn
};

const client = mqtt.connect(options);

client.on('connect', function () {
    console.log('Connected to HiveMQ Cloud');
});


module.exports = client