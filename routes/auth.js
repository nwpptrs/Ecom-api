const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/authCheck.js");

const { register, login, currentUser } = require("../controller/auth.js");

router.post("/register", register);
router.post("/login", login);
router.post("/current-user", authCheck, currentUser);
router.post("/current-admin", authCheck, adminCheck, currentUser);

module.exports = router;
