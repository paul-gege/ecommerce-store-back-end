const express = require("express");
const router = express.Router();

const {create, categoryById, read, update, list, remove} = require("../controllers/category.js");
const {requireSignin, isAuth, isAdmin} = require("../controllers/auth.js");
const {userById} = require("../controllers/user.js")


router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);
router.get("/category/:categoryId", read);
router.put("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, update);
router.delete("/category/:categoryId/:userId", requireSignin, isAuth, isAdmin, remove);
router.get("/categories", list);

router.param("userId", userById);
router.param("categoryId", categoryById);

module.exports = router;