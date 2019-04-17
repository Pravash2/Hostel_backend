//importing the package module
const mongoose = require("mongoose");

//defining the mongoose schema for the Attendance
let attendanceSchema = new mongoose.Schema({
	date: { type: String, default: Date.now },
	students: [
		{
			studentDetail: {
				type: mongoose.Schema.Types.ObjectId, //Stores the id of the studnet
				ref: "Student"
			},
			checking: [
				{
					types: String,
					timing: { type: Date, default: Date.now } //Stores the Date type value
				}
			]
		}
	]
});

//exporting attendance Schema
module.exports = Attendance = mongoose.model("attendance", attendanceSchema);
