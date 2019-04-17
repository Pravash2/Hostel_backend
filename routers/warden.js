//importing the packages
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//importing the models
const Student = require("../models/student");
const Parent = require("../models/parents");
const Warden = require("../models/warden");
const Mentor = require("../models/mentor");
const Pass = require("../models/pass");

//importing the keys for mlab and jwt
const keys = require("../config/keys");

//testing the warden routes
router.get("/test", (req, res) => {
	res.json({ msg: "Warden test works" });
});

//get current user
router.get("/", (req, res) => {
	async function getMentordetails(params) {
		const mentor = await Warden.find();
		console.log(mentor);
		res.send(mentor);
	}
	getMentordetails();
});

//Register of Warden
router.post("/register", (req, res) => {
	async function createWarden() {
		Warden.findOne({ employeeId: req.body.employeeId }).then(user => {
			//checking any existing user at that employess id
			if (user) {
				return res.json({ error: "Employee ID already present" });
			} else {
				const body = {
					name: req.body.name,
					employeeId: req.body.employeeId.toLowerCase(),
					email: req.body.email,
					phoneNo: req.body.phoneNo,
					type: req.body.type,
					password: req.body.password
				};
				const warden = new Warden(body); //creating the new Warden object

				//hasing the password
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(warden.password, salt, (err, hash) => {
						if (err) throw err;
						warden.password = hash;
						warden
							.save()
							.then(user => res.json(user))
							.catch(err => console.log(err));
					});
				});
			}
		});
	}
	createWarden();
});

//Get all applied pass
router.get(
	"/pass",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function getPass() {
			const pass = await Pass.find({
				mentorApporval: true,
				parentApproval: true,
				gateEntry: false
			}).populate("studentDetail");
			res.send(pass);
		}
		getPass();
	}
);

//Approaving the pass
router.get("/pass/yes/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id).populate("studentDetail");
		pass.wardenApproval = true;
		pass.wardenReplied = true;
		const result = await pass.save();
		res.json(result);
	}
	updatePass();
});

//route for decline pass
router.get("/pass/no/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id).populate("studentDetail");
		pass.wardenApproval = false;
		pass.wardenReplied = true;
		const result = await pass.save();
		res.json(result);
	}
	updatePass();
});

//route for getting the passes
router.post("/pass/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id);
		pass.wardenApproval = req.body.wardenapporve;
		pass.wardenText = req.body.wardenText;
		pass.wardenReplied = true;
		const result = await pass.save();
		res.json(result);
	}
	updatePass();
});

//route for handeling the login method
router.post("/login", (req, res) => {
	const employeeId = req.body.employeeId.toLowerCase();
	const password = req.body.password;

	Warden.findOne({ employeeId: employeeId }).then(user => {
		if (!user) {
			return res.status(404).json({ employeeId: "employeeId not found" });
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
					{ expiresIn: 3600 },
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

//routes for the food pass
router.get(
	"/food",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function Get() {
			Student.find().then(result => res.send(result));
		}
		Get();
	}
);

//routes for getting the current users
router.get(
	"/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);

//exporting the router
module.exports = router;
