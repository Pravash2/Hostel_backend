//importing the mongoose package module
const mongoose = require("mongoose");

//Define mongoose Schema for the Parent
let ParentSchema = new mongoose.Schema({
	name: String,
	email: String,
	phoneNo: Number,
	type: String,
	parentId: String,
	password: String,
	childList: [
		{
			type: mongoose.Schema.Types.ObjectId, //Stores the Id student
			ref: "Student"
		}
	]
});

//exporting the Parent Schema
module.exports = Parents = mongoose.model("parents", ParentSchema);
