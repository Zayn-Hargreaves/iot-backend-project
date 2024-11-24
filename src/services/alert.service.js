const sendMail = require("../helpers/email")
const Alert = require("../models/alert.model");
const FirebaseToken = require("../models/firebaseToken.model");
const {sendNotification} = require("../helpers/firebaseNotification")
class alertService{
    static createAlert = async({deviceId,alert_type,message})=>{
        // await sendMail("Quanva.b21cn618@stu.ptit.edu.vn", alert_type, message);
        const tokens = await FirebaseToken.find().lean();
        for (const token of tokens) {
            const registrationToken = token.registrationToken
            sendNotification(registrationToken, {alert_type, message});
        }
        global._io.emit("switch system", message);
        return await Alert.create({deviceId, alert_type, message})
    }
    static getAllAlert = async()=>{
        return await Alert.find().lean();
    }
}

module.exports = alertService