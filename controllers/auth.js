const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const {errorHandler} = require("../helpers/dbErrorHandler.js");

exports.signup = async (req,res) => {
	const userExists = await User.findOne({email: req.body.email});
	
	if(userExists){
		return res.status(403).json({
			error: 'Email is taken!'
		});
	}

	const user = new User(req.body);

	user.save((err,user) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		user.salt = undefined;
		user.hashed_password = undefined;
		res.json({
			user
		});
	});
};

exports.signin = (req, res) => {
	const {email, password} = req.body;

	User.findOne({email}, (err, user) => {
		if(err || !user){
			return res.status(400).json({
				error: "User with that email address does not exist. Please sign up"
			});
		}

		if(!user.authenticate(password)){
			return res.status(401).json({
				error: "Incorrect email or password"
			});
		}
	
		const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)

		//persist our token for 9999s
		res.cookie("token", token, {expire: new Date() + 9999});

		const {_id, name, email, role} = user;
		return res.json({token, user: {_id, email, name, role}});
	});
};

exports.signout = (req,res) => {
	res.clearCookie("token");
	res.json({message: "Signout success"});
}

/*******************************************************************************************************************
// Make the algorithm better https://stackoverflow.com/questions/39874731/unauthorizederror-invalid-algorithm-express-jwt
********************************************************************************************************************/
exports.requireSignin = expressJwt({
	secret: process.env.JWT_SECRET,
	userProperty: "auth",
	algorithms: ['HS256']
})

exports.isAuth = (req, res, next) => {
	let user = req.profile && req.auth && req.profile._id == req.auth._id;
	if(!user){
		return res.status(403).json({
			error: "Access denied"
		})
	}

	next();
}

exports.isAdmin = (req,res, next) => {
	if(req.profile.role === 0){
		return res.status(403).json({
			error: "Admin resource! Access denied"
		});
	}
	next();
}