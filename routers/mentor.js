
//importing the list package module
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");


//importing the Models of Mentor , Pass  and Keys
const Mentor = require("../models/mentor");
const Pass = require("../models/pass");
const keys = require("../config/keys");


//For the Testing the mentor Routes
router.get("/test", (req, res) => {
	res.json({ msg: "mentor test works" });
});


//Register of Mentor
router.post("/register", (req, res) => {
	async function createMentor() {
		Mentor.findOne({ employeeId: req.body.employeeId }).then(user => {
			if (user) {
				return res.json({ error: "Employee ID already present" });
			} else {
				const body = {    //making an  object
					name: req.body.name,
					employeeId: req.body.employeeId.toLowerCase(),
					email: req.body.email,
					phoneNo: req.body.phoneNo,
					password: req.body.password,
					type: req.body.type
				};
				const mentor = new Mentor(body); //making Real obect of new mentor


				bcrypt.genSalt(10, (err, salt) => {   //creating the hash of the password
					bcrypt.hash(mentor.password, salt, (err, hash) => {
						if (err) throw err;
						mentor.password = hash;//storing the hashed password to mentor password
						mentor
							.save()						//Storing the Hashed Password to Database
							.then(user => res.json(user))  
							.catch(err => console.log(err));
					});
				});
			}
		});
	}
	createMentor();
});

//Get all applied pass
router.get(
	"/pass",
	passport.authenticate("jwt", { session: false }), //authorization the routes
	(req, res) => {
		async function getPass() {
			const pass = await Pass.find({  
				parentApproval: true,
				wardenApproval: false,
				gateEntry: false
			}).populate("studentDetail");
			res.send(pass);
			
		}
		getPass();
	}
);


//For Approaving the Pass
router.get("/pass/yes/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id).populate("studentDetail"); 
		//populate means getting all the student Details that is populating the student details
		pass.mentorApporval = true;
		pass.mentorReplied = true;
		const result = await pass.save();  //saving the pass details
		res.json(result);
	}
	updatePass();
});


//For Declining The pass
router.get("/pass/no/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id).populate("studentDetail");
		pass.mentorApporval = false;
		pass.mentorReplied = true;
		const result = await pass.save();
		res.json(result);
	}
	updatePass();
});

//Getting the Pass Details 
router.get("/pass/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id);
		pass.mentorApporval = req.body.mentorApporval;
		pass.mentorText = req.body.mentorText;
		pass.mentorReplied = true;
		const result = await pass.save();
		res.json(result);
	}
	updatePass();
});


//Routes for the Login
router.post("/login", (req, res) => {
	const employeeId = req.body.employeeId.toLowerCase();
	const password = req.body.password;

	Mentor.findOne({ employeeId: employeeId }).then(user => {  //finding the paticular match Employee
		if (!user) {
			return res.status(404).json({ employeeId: "employeeId  not found" });
		}

		//Check Password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				//Create JWT Payload
				const payload = {
					id: user.id,
					name: user.name,
					employeeId: user.employeeId,
					type: user.type
				};

				//Sign Token
				jwt.sign(
					payload,
					keys.secretOrKey,
					{ expiresIn: 3600 }, //Expire Date of the Token
					(err, token) => {
						res.json({ success: true, token: `Bearer ${token}` });
					}
				);
			} else {
				return res.status(400).json({ password: "Password Incorrect" });
			}
		});
	});
});


//For getting the Current Profile
router.get(
	"/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);


//exporting the router
module.exports = router;
