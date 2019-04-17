//importing the packages
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//importing the models of parents,Mentor,Pass,Keys
const Parent = require("../models/parents");
const Mentor = require("../models/mentor");
const Pass = require("../models/pass");
const keys = require("../config/keys");

//Testing the Parent Routes
router.get("/test", (req, res) => {
	res.json({ msg: "Parent test works" });
});


//get current user
router.get("/", (req, res) => {
	async function getMentordetails(params) {
		const mentor = await Mentor.find(); //Finding all the mentors
		console.log(mentor);
		res.send(mentor);
	}
	getMentordetails();
});

//Register of Parent
router.post("/register", (req, res) => {
	async function createParent() {
		Parent.findOne({ parentId: req.body.parentId }).then(user => {
			if (user) {
				return res.json({ error: " PrarentId already present" });
			} else {
				Student.findOne({ registrationNumber: req.body.parentId }).then(
					user => {
						if (!user) {
							return res.json({
								error: " Student Registation Number Not present"
							});
						} else {
							const body = {
								name: req.body.name,
								email: req.body.email,
								phoneNo: req.body.phoneNo,
								password: req.body.password,
								parentId: req.body.parentId.toLowerCase(),
								type: req.body.type
							};
							const parent = new Parent(body);

							bcrypt.genSalt(10, (err, salt) => {
								bcrypt.hash(parent.password, salt, (err, hash) => {
									if (err) throw err;
									parent.password = hash;
									parent
										.save()
										.then(users => {
											user.parent = users._id;
											user.save().then(re => console.log(re));
											res.json(users);
										})
										.catch(err => console.log(err));
								});
							});
						}
					}
				);
			}
		});
	}
	createParent();
});

//Get all applied pass
router.get(
	"/pass",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function getPass() {
			const pass = await Pass.find({ gateEntry: false }).populate(
				"studentDetail"
			);
			const result = pass.filter(
				pass => `${pass.studentDetail.parent}` === `${req.user._id}`
			);

			res.send(result);
			// console.log(`${pass[0].studentDetail.parent}` === `${req.user._id}`);
		}
		getPass();
	}
);


//Approave the Passs
router.get(
	"/pass/yes/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function updatePass() {
			const pass = await Pass.findById(req.params.id).populate("studentDetail");
			pass.parentApproval = true;
			pass.parentReplied = true;
			const result = await pass.save();
			res.json(result);
		}
		updatePass();
	}
);

//Decline the Passes
router.get(
	"/pass/no/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function updatePass() {
			const pass = await Pass.findById(req.params.id).populate("studentDetail");
			pass.parentApproval = false;
			pass.parentReplied = true;
			const result = await pass.save();
			res.json(result);
		}
		updatePass();
	}
);


//Getting the Pass Details
router.post(
	"/pass/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function updatePass() {
			const pass = await Pass.findById(req.params.id);
			pass.parentApproval = req.body.parentApproval;
			pass.ParentText = req.body.ParentText;
			pass.parentReplied = true;
			const result = await pass.save();
			res.json(result);
		}
		updatePass();
	}
);


//Login Routes of the Parents
router.post("/login", (req, res) => {
	const parentId = req.body.parentId.toLowerCase();
	const password = req.body.password;

	Parent.findOne({ parentId: parentId }).then(user => {
		if (!user) {
			return res.status(404).json({ parentId: "parentId  not found" });
		}

		//Check Password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				//Create JWT Payload
				const payload = {
					id: user.id,
					name: user.name,
					parentId: user.parentId,
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

//Getting the Current User
router.get(
	"/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);


//Exporting the router
module.exports = router;
