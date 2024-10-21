const { mongoose, model, Schema, Types } = require("mongoose");
const DOCUMENT_NAME = "Device";
const COLLECTION_NAME = "Devices";


const deviceSchema = new mongoose.Schema({
    deviceCode: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

const Device = mongoose.model(DOCUMENT_NAME, deviceSchema);
module.exports = Device;
