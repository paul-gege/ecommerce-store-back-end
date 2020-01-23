const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
	{
		index: {
			type: Number,
			required: true
		},
		productId: {
			type: String,
			required: true
		},
		photo: {
			data: Buffer,
			contentType: String
		} 
	}, {timestamp: true}
);

module.exports = mongoose.model("Image", imageSchema);