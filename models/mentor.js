//importing the mongoose Packages
const mongoose = require("mongoose");

//Defining the mongoose Schema for the Mentor
let MentorSchema = new mongoose.Schema({
	name: String,
	type: String,
	employeeId: Number,
	phoneNo: Number,
	email: String,
	password: String,
	menteeList: [
		{
			type: mongoose.Schema.Types.ObjectId, //Stores the Student Id
			ref: "Student"
		}
	]
});

//exporting the mentor Schema
module.exports = Mentor = mongoose.model("mentors", MentorSchema);
