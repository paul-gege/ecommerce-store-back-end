const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;
const Image = require("./images.js");


const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
			maxlength: 32
		},
		description:{
			type: String,
			required: true,
			maxlength: 2000
		}, 
		price: {
			type: Number,
			trim: true,
			required: true,
			maxlength: 32
		},
		category: {
			type: ObjectId,
			ref: "Category",
			//required: true
		},
		quantity: {
			type: Number
		},
		sold: {
			type: Number,
			default: 0
		},
		imagecount: {
			type: Number,
			default: 0
		},
		//One to many relationship - One product has many pictures
		// Products will not have photos, images will store product id's though
		// photos: [
		// 	{
		// 		type: String,
		// 	}
		// ],
	}, {timestamp: true}

);

productSchema.methods = {
	resetPhotos: function() {
		this.model('Image').deleteMany({productId: this._id.toString()}, (err) => {
			console.log("Deleted all images for product " + this._id.toString());
		});
	}
};

module.exports = mongoose.model("Product", productSchema)