const express = require("express");
const router = express.Router();
const { authCheck, adminCheck } = require("../middleware/authCheck");
const {
  listUsers,
  changeStatus,
  changeRole,
  getUserCart,
  getUserOrders,
  addUserAddress,
  emptyUserCart,
  userCart,
  saveOrder,
  createOrderReview,
  getAllReviews,
  updateUserProfile,
} = require("../controller/user");

router.get("/users", authCheck, adminCheck, listUsers);
router.post("/change-status", authCheck, adminCheck, changeStatus);
router.post("/change-role", authCheck, adminCheck, changeRole);

router.post("/user/cart", authCheck, userCart);
router.get("/user/cart", authCheck, getUserCart);
router.delete("/user/cart", authCheck, emptyUserCart);

router.post("/user/address", authCheck, addUserAddress);

router.post("/user/order", authCheck, saveOrder);
router.get("/user/order", authCheck, getUserOrders);
router.post("/user/order/review", authCheck, createOrderReview);
router.get("/user/reviews", getAllReviews);
router.post("/user/profile", authCheck, updateUserProfile);

module.exports = router;
