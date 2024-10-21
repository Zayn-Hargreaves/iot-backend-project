const express = require("express")
const {asyncHandle} = require("../../helpers/asyncHandle");
const systemController = require("../../controllers/system.controller");
systemController
const router = express.Router();
router.get("/", asyncHandle(systemController.turnOnOff))

module.exports = router