const express = require("express")
const {asyncHandle} = require("../../helpers/asyncHandle");
const statsController = require("../../controllers/stats.controller");
const router = express.Router();
router.get("/", asyncHandle(statsController.getNewData))

module.exports = router