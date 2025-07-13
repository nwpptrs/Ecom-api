const express = require("express");
const router = express.Router();
const { authCheck } = require("../middleware/authCheck.js");

const { getOrderAdmin, changeOrderStatus } = require("../controller/admin.js");

router.put("/admin/order-status", authCheck, changeOrderStatus);
router.get("/admin/orders", authCheck, getOrderAdmin);

module.exports = router;
