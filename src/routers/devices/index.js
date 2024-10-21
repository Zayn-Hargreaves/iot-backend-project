const express = require("express")
const {asyncHandle} = require("../../helpers/asyncHandle");
const deviceController = require("../../controllers/device.controller");
const router = express.Router();
router.get("/", asyncHandle(deviceController.getAllDevice))
router.get("/:deviceId", asyncHandle(deviceController.getDeviceById))


module.exports = router