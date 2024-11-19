const { mongoose, model, Schema, Types } = require("mongoose");
const DOCUMENT_NAME = "SensorData";
const COLLECTION_NAME = "SensorData";

const sensorDataSchema = new mongoose.Schema({
    temperature:{
        type:Number,
    },
    tds:{
        type:Number,
    },
    flowRate:{
        type:Number,
    },
    relay:{
        type:Number,
    }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: COLLECTION_NAME
});

const SensorData = mongoose.model(DOCUMENT_NAME, sensorDataSchema);
module.exports = SensorData;
