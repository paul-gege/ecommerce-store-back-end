const express = require("express");
const router = express.Router();

const {
	create, 
	productById,
	imageByProduct, 
	read, 
	remove, 
	update, 
	list, 
	listRelated, 
	listCategories, 
	listBySearch,
	listSearch,
	photo
} = require("../controllers/product.js");
const {requireSignin, isAuth, isAdmin} = require("../controllers/auth.js");
const {userById} = require("../controllers/user.js");

router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.get("/product/:productId", read);
router.delete("/product/:productId/:userId", requireSignin, isAuth, isAdmin, remove);
router.put("/product/:productId/:userId", requireSignin, isAuth, isAdmin, update);
router.get("/products", list);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.post("/products/by/search", listBySearch);
router.get("/products/photo/:productId/:imageNumber", photo);
router.get("/products/search", listSearch);


// router.post("/product/test", create)

router.param("userId", userById);
router.param("productId", productById);
router.param("imageNumber", imageByProduct);

module.exports = router;