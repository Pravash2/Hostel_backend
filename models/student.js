//importing the mongoose package model
const mongoose = require("mongoose");

//defining the schema for Student
let studentSchema = new mongoose.Schema({
	name: String,
	password: String,
	type: String,
	registrationNumber: String,
	rollNumber: String,
	branch: String,
	year: Number,
	course: String,
	group: String,
	section: String,
	contactNumber: Number,
	Token: Date,
	hostel: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Hostel"
	},
	mentor: {
		type: mongoose.Schema.Types.ObjectId, //Stores the Id of mentor
		ref: "Mentor"
	},
	parent: {
		type: mongoose.Schema.Types.ObjectId, //stores the Id of Parent
		ref: "Parent"
	},
	localGuardian: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Parent"
	},
	warden: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Warden"
	},
	securityGuard: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "SecurityGuard"
	},
	photo: {
		type: String
	},
	email: String
});

//export the Student Schema
module.exports = Student = mongoose.model("Student", studentSchema);
