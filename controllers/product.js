const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product.js");
const Image = require("../models/images.js");
const {errorHandler} = require("../helpers/dbErrorHandler.js");


exports.productById = (req,res,next,id) => {
	Product.findById(id).populate("category").exec((err, product)=>{
		if(err || !product){
			return res.status(400).json({
				error: "Product not found"
			});
		}
		req.product = product;
		next();
	});
}

exports.imageByProduct = (req, res, next, index) => {
	if(req.product.imagecount > index){
		Image
		.findOne({index: index, productId: req.product._id.toString()})
		.exec((err, data) => {
			if(err){
				next();
			}

			req.image = data;
			next();
		});	
	}	
}

exports.read = (req,res) => {
	//Dont need to make this photo array undefined - just need to know how many images uploaded
	//req.product.photos = undefined;
	return res.json(req.product);
}

exports.remove = (req, res) => {
	let product = req.product;
	product.resetPhotos();
	product.remove((err, deletedProduct) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({
			message: "Product deleted successfully"
		});
	});
}

exports.update = (req,res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.multiples = true;

	form.parse(req, (err, fields, files) => {
		if(err){
			return res.status(400).json({
				error: "Images could not be uploaded"
			});
		}


		let product = req.product;
		product = _.extend(product, fields);

		product.resetPhotos();

		//files.photos holds is an array of all our files
		if(files.photos){
			let photoArray = files.photos;
			if(!Array.isArray(photoArray)){
				photoArray = [photoArray];
			}

			product.imagecount = photoArray.length;

			//Make sure all uploads have filesizes < 1mb
			photoArray.forEach((file) => {
				if(file.size > 1000000){
					return res.status(400).json({
						error: "Image should be less than 1mb in size"
					});
				}

			});

			photoArray.forEach((file, index) => {

				let imageObject = {
					index: index,
					productId: product._id.toString(),
					photo: {
						data: fs.readFileSync(file.path),
						contentType: file.type
					}
				};

				let imageUpload = new Image(imageObject);
				//Save returns a promise but also has a callback function
				imageUpload.save()
				.then((image) => {
					
				})
				.catch((error) => {
					return res.status(400).json({
						error: errorHandler(err)
					});
				});
			});
		}

		product.save((err,result) => {
			if(err){
				Image.deleteMany({productId: product._id.toString()}, (err) => {
					return res.status(400).json({
						error: errorHandler(err)
					})
				});

				return res.status(400).json({
					error: errorHandler(err)
				})
			}
			res.json(result);
		});

	});

}

exports.create = (req,res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	//Allows our file uploads to have multiple inputs
	form.multiples = true;
	form.parse(req, (err, fields, files) => {
		if(err){
			return res.status(400).json({
				error: "Images could not be uploaded"
			});
		}

 		//check for all fields
        const {
            name,
            description,
            price,
            category,
            quantity,
        } = fields;

        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !quantity
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }


		let product = new Product(fields);
		
		//files.photos holds is an array of all our files
		if(files.photos){
			let photoArray = files.photos;
			if(!Array.isArray(photoArray)){
				photoArray = [photoArray];
			}

			product.imagecount = photoArray.length;

			//Make sure all uploads have filesizes < 1mb
			photoArray.forEach((file) => {
				if(file.size > 1000000){
					return res.status(400).json({
						error: "Image should be less than 1mb in size"
					});
				}

			});

			photoArray.forEach((file, index) => {

				let imageObject = {
					index: index,
					productId: product._id.toString(),
					photo: {
						data: fs.readFileSync(file.path),
						contentType: file.type
					}
				};

				let imageUpload = new Image(imageObject);
				//Save returns a promise but also has a callback function
				imageUpload.save()
				.then((image) => {
					
				})
				.catch((error) => {
					return res.status(400).json({
						error: errorHandler(err)
					});
				});
			});
		}

		product.save((err,result) => {
			if(err){
				Image.deleteMany({productId: product._id.toString()}, (err) => {
					return res.status(400).json({
						error: errorHandler(err)
					})
				});

				return res.status(400).json({
					error: errorHandler(err)
				})
			}
			res.json(result);
		});

	});
}

//Displaying things like Most popular, new arrivals etc

exports.list = (req, res) => {

	//Check for parameters passed in our url query - if any we use it if none we use defaults
	let order = req.query.order ? req.query.order : "asc";
	let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;

	Product.find()
		.populate("category")
		.sort([[sortBy, order]])
		.limit(limit)
		.exec((err, products) => {
			if(err) {
				return res.status(400).json({
					error: "Products not found"
				});
			}
			res.json(products);
		});
}


exports.listRelated = (req, res) => {
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;

	Product.find({_id: {$ne: req.product}, category: req.product.category._id})
		.limit(limit)
		.populate("category", "_id name")
		.exec((err, products) => {
			if(err){
				return res.status(400).json({
					error: "Products not found"
				})
			}
			res.json(products);
		});
}

//Read about distinct - https://mongoosejs.com/docs/api/model.html#model_Model.distinct
//Distinct just gets one of every category used in products
exports.listCategories = (req, res) => {
	Product.distinct("category", {}, (err, categories) => {
		if(err){
			return res.status(400).json({
				error: "Categories not found"
			});
		}
		res.json(categories);
	});
}

exports.listBySearch = (req, res) => {
	let order = req.body.order ? req.body.order : "desc";
	let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
	let limit = req.body.limit ? parseInt(req.body.limit) : 100;
	let skip = parseInt(req.body.skip);
	let findArgs = {};

	//this foreach just lists the keys in the object
	for(let key in req.body.filters){
		if(req.body.filters[key].length > 0) {
			if(key === 'price'){
				findArgs[key] = {
					$gte: req.body.filters[key][0],
					$lte: req.body.filters[key][1]
				};
			} else if(key === 'name') {
				findArgs[key] = { $regex: `.*${req.body.filters[key]}.*`, $options: 'i'}
			} else {
				findArgs[key] = req.body.filters[key];
			}
		}
	}

	Product.find(findArgs)
		.populate("category")
		.sort([[sortBy, order]])
		.skip(skip)
		.limit(limit)
		.exec((err, data) => {
			if(err) {
				return res.status(400).json({
					error: "Products not found"
				});
			}
			res.json({
				size: data.length,
				data
			})
		})
}

exports.photo = (req, res, next) => {
	if(req.image.photo.data) {
		res.set("Content-Type", req.image.photo.contentType)
		return res.send(req.image.photo.data);
	}
	next();
}

exports.listSearch = (req, res) => {
	const query = {};

	if(req.query.search){
		query.name = {$regex: req.query.search, $options: "i"};

		if(req.query.category && req.query.category != "All"){
			query.category = req.query.category;
		}

		Product.find(query, (err, products) => {
			if(err){
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			res.json(products);
		})
	}
}

exports.decreaseQuantity = (req, res, next) => {
	let bulkOps = req.body.order.products.map(item => {
		return {
			updateOne: {
				filter: {_id: item._id},
				update: {$inc: {quantity: -item.count, sold: +item.count}}
			}
		};
	});

	Product.bulkWrite(bulkOps, {}, (error, products) => {
		if(error){
			return res.status(400).json({
				error: "could not update product"
			});
		}
		next();
	});
};