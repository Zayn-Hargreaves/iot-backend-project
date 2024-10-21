const { mongoose, model, Schema, Types } = require("mongoose");
const DOCUMENT_NAME = "SensorData";
const COLLECTION_NAME = "SensorData";

const sensorDataSchema = new mongoose.Schema({
    device_id: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref:"Device"
    },
    value: {
        type: Number, 
        required: true
    },
    unit:{
        type:String,
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Chỉ tạo trường createdAt, không cần updatedAt
    collection: COLLECTION_NAME
});

const SensorData = mongoose.model(DOCUMENT_NAME, sensorDataSchema);
module.exports = SensorData;
