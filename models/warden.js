//importing the mongooose package
const mongoose = require("mongoose");

//defining the Warden Schema
let WardenSchema = new mongoose.Schema({
	name: String,
	employeeId: Number,
	email: String,
	phoneNo: Number,
	type: String,
	password: String,
	studentList: [
		//Stores the List of Student IDs in Array
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student"
		}
	],
	hostel: [
		//Stores the List of hostel Ids in Array
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Hostel"
		}
	]
});

//exporting the warden schema
module.exports = Warden = mongoose.model("warden", WardenSchema);
