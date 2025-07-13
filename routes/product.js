const express = require("express");
const router = express.Router();
const {
  create,
  list,
  read,
  update,
  remove,
  searchFilters,
  listby,
  createImages,
  removeImage,
} = require("../controller/product");
const { authCheck, adminCheck } = require("../middleware/authCheck.js");

router.get("/products/:count", list);
router.get("/product/:id", read);
router.post("/product", authCheck, adminCheck, create);
router.put("/product/:id", authCheck, adminCheck, update);
router.post("/productby", listby);
router.post("/search/filters", searchFilters);
router.delete("/product/:id", authCheck, adminCheck, remove);

router.post("/images", authCheck, adminCheck, createImages);
router.post("/removeimage", authCheck, adminCheck, removeImage);
module.exports = router;
