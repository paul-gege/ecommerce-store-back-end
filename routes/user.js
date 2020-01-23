const express = require("express");
const router = express.Router();
const {userById, read, update, purchaseHistory} = require("../controllers/user.js");
const {requireSignin, isAuth, isAdmin} = require("../controllers/auth.js");

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory);

router.param("userId", userById);

module.exports = router