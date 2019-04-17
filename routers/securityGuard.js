//importing all the Packages modules
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//importing the models Sechema
const SecurityGuard = require("../models/securityGuard");
const Pass = require("../models/pass");
const keys = require("../config/keys");


//Testing the Security Gaurd Routes
router.get("/all", (req, res) => {
	res.json({ msg: "securityGuard test works" });
});


//Register of securityGuard
router.post("/register", (req, res) => {
	async function createsecurityGuard() {
		SecurityGuard.findOne({ employeeId: req.body.employeeId }).then(user => { //finding the particular security gaurd
			if (user) {
				return res.json({ error: "Employee ID already present" });
			} else {
				const body = {
					name: req.body.name,
					employeeId: req.body.employeeId.toLowerCase(),
					password: req.body.password,
					type: req.body.type,
					phoneNo: req.body.phoneNo
				};

				const securityGuard = new SecurityGuard(body);

				//Hashing the Password
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(securityGuard.password, salt, (err, hash) => {
						if (err) throw err;
						securityGuard.password = hash;

						securityGuard
							.save()
							.then(users => res.json(users))
							.catch(err => console.log(err));
					});
				});
			}
		});
	}

	createsecurityGuard();
});

//Get all applied pass
router.get(
	"/pass",
	passport.authenticate("jwt", { session: false }), //Authorization of routes
	(req, res) => {
		async function getPass() {
			const pass = await Pass.find({
				mentorApporval: true,
				wardenApproval: true,
				parentApproval: true,
				gateEntry: false
			}).populate("studentDetail");

			res.send(pass);
			
		}
		getPass();
	}
);


//Login Routes for the Security Gaurd
router.post("/login", (req, res) => {
	const employeeId = req.body.employeeId.toLowerCase();
	const password = req.body.password;

	SecurityGuard.findOne({ employeeId: employeeId }).then(user => {
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


//routes for the entering the pass to outgate
router.get("/pass/out/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id).populate("studentDetail");
		pass.gateOut = true;
		pass.gateOutTime = Date.now();
		const result = await pass.save();
		res.json(result);
	}
	updatePass();
});


//routes for the completing the pass at the gate
router.get("/pass/in/:id", (req, res) => {
	async function updatePass() {
		const pass = await Pass.findById(req.params.id).populate("studentDetail"); 
		pass.gateEntry = true;
		pass.gateEntryTime = Date.now();
		const result = await pass.save();
		res.json(result);
	}
	updatePass();
});


//Getting the current user
router.get(
	"/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);


//exporting the router
module.exports = router;
