//exporting the mongoose package module
const mongoose = require("mongoose");

//Defining the Security Guard Schema
let SecurityGuardSchema = new mongoose.Schema({
	name: String,
	type: String,
	employeeId: Number,
	phoneNo: Number,
	email: String,
	password: String
});

//exporting the Security Guard Schema
module.exports = SecurityGuard = mongoose.model(
	"securityguard",
	SecurityGuardSchema
);
