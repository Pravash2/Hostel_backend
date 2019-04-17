//importing the mongoose package module
const mongoose = require("mongoose");

//Defining the Pass Schema
let passSchema = new mongoose.Schema({
	mentorApporval: { type: Boolean, default: false }, //Stores the Boolean Value either True or false
	wardenApproval: { type: Boolean, default: false }, //Stores the Boolean Value either True or false
	parentApproval: { type: Boolean, default: false }, //Stores the Boolean Value either True or false
	mentorReplied: { type: Boolean, default: false }, //Stores the Boolean Value either True or false
	wardenReplied: { type: Boolean, default: false }, //Stores the Boolean Value either True or false
	parentReplied: { type: Boolean, default: false }, //Stores the Boolean Value either True or false
	gateEntry: { type: Boolean, default: false },
	gateOut: { type: Boolean, default: false },
	gateOutTime: Date, //Stores the Date type Value
	gateEntryTime: Date,
	ParentText: String,
	wardenText: String,
	mentorText: String,
	outDate: Date,
	inDate: Date,
	purpose: String,
	studentDetail: {
		type: mongoose.Schema.Types.ObjectId, //Student Id stores
		ref: "Student"
	}
});

//exporting the pass Schema model
module.exports = Pass = mongoose.model("pass", passSchema);
