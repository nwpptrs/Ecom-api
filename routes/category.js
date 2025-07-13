const express = require("express");
const router = express.Router();
const { list, create, remove } = require("../controller/category.js");
const { authCheck, adminCheck } = require("../middleware/authCheck.js");

router.get("/category", list);
router.post("/category", authCheck, adminCheck, create);
router.delete("/category/:id", authCheck, adminCheck, remove);

module.exports = router;
