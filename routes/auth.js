const express = require("express");
const router = express.Router();
const {signup, signin, signout, requireSignin} = require("../controllers/auth.js");
const {userSignupValidator} = require("../validator/index.js");


router.post("/signin", signin);
router.post("/signup", userSignupValidator, signup);
router.get("/signout", signout);


module.exports = router;