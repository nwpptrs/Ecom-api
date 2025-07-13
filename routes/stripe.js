const express = require("express");
const router = express.Router();
const { authCheck } = require("../middleware/authCheck.js");
const { createPaymentIntent } = require("../controller/stripe.js");

router.post("/payment-intent", authCheck, createPaymentIntent);

module.exports = router;
