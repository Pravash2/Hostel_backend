//importing the package modules
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//importing the models schema
const Warden = require("../models/warden");
const Parent = require("../models/parents");
const Mentor = require("../models/mentor");
const SecurityGuard = require("../models/securityGuard");
const Attendance = require("../models/Attendance");
const Student = require("../models/student");
const Pass = require("../models/pass");

//importing the auth keys and database the keys
const keys = require("../config/keys");

//routes for the getting the pass details
router.get(
	"/pass",
	passport.authenticate("jwt", { session: false }), //authorization of routes
	(req, res) => {
		Pass.findOne({ studentDetail: req.user.id })
			.populate("studentDetail")
			.then(result => res.json(result))
			.catch(err => console.log(err));
	}
);

//routes for the registation
router.post("/register", (req, res) => {
	async function createCourse() {
		Student.findOne({ registrationNumber: req.body.registrationNumber }).then(
			user => {
				//checking the existing student with same registation number
				if (user) {
					return res.json({ error: " Registration Number already present" });
				} else {
					const body = {
						//making an obect as body
						name: req.body.name,
						password: req.body.password,
						registrationNumber: req.body.registrationNumber.toLowerCase(),
						rollNumber: req.body.rollNumber,
						branch: req.body.branch,
						year: req.body.year,
						course: req.body.course,
						group: req.body.group,
						section: req.body.section,
						type: req.body.type,
						contactNumber: req.body.contactNumber
					};

					const student = new Student(body); //creating new student obect

					//Hashing the password
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(student.password, salt, (err, hash) => {
							if (err) throw err;
							student.password = hash;
							student
								.save() //Saving the student to database
								.then(user => res.json(user))
								.catch(err => console.log(err));
						});
					});
				}
			}
		);
	}

	createCourse();
});

//routes for getting all users
router.get("/user", (req, res) => {
	async function Get(params) {
		Student.find().then(result => res.json(result));
	}
	Get();
});

//routes for the getting the pass details
router.get(
	"/pass",
	passport.authenticate("jwt", { session: false }), //Authorization of the user
	(req, res) => {
		async function Get() {
			Pass.findOne({ studentDetail: req.user._id })
				.populate("studentDetail") //find details of the student
				.then(result => res.json(result));
		}
		Get();
	}
);

//routes for the creating the Pass
router.post(
	"/pass",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function createCourse() {
			const body = {
				outDate: req.body.outdate,
				inDate: req.body.indate,
				purpose: req.body.purpose,
				studentDetail: req.user._id
			};
			const pass = new Pass(body);

			const result = await pass.save();
			res.json(result);
		}
		createCourse();
	}
);

//routes for deleting the pass
router.delete(
	"/pass/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function createCourse() {
			const pass = await Pass.deleteOne({ _id: req.params.id }); //Deleting the pass
			res.json(pass);
		}
		createCourse();
	}
);

//routes for the login
router.post("/login", (req, res) => {
	const email = req.body.registrationNumber.toLowerCase();
	const password = req.body.password;

	Student.findOne({ registrationNumber: email }).then(user => {
		if (!user) {
			return res.status(404).json({ email: "User not found" }); //If email not match with database email Id
		}

		//Check Password
		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				//Create JWT Payload
				const payload = {
					id: user.id,
					name: user.name,
					email: user.registrationNumber,
					type: user.type
				};

				//Sign Token creation
				jwt.sign(
					payload,
					keys.secretOrKey,
					{ expiresIn: 3600 }, //expire time
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

//route for getting the current student
router.get(
	"/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);

//routes for adding the parents
router.post(
	"/addParent",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Student.findById(req.user._id).then(user => {
			if (user) {
				Parent.findOne({ parentId: req.body.parentId }).then(parent => {
					//Finding the Parent
					user.parent = parent._id;
					user
						.save()
						.then(user => res.status(200).json(user))
						.catch(err => console.log(err));
				});
			} else {
				res.status(400).json({ err: "parent not found" });
			}
		});
	}
);

//routes for the adding the Mentor
router.post(
	"/addMentor",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Student.findById(req.user._id).then(user => {
			if (user) {
				Mentor.findOne({ employeeId: req.body.employeeId }).then(mentor => {
					user.mentor = mentor._id;
					user
						.save()
						.then(user => res.json(mentor))
						.catch(err => console.log(err));
				});
			}
		});
	}
);

//routes for handeling the attendance
router.post(
	"/attendance",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function creatAttendance() {
			//comparing the attendance date to current date
			//if current date matched with database date then it push new student existing array
			//else new attendance is created
			Attendance.findOne({
				date: Date()
					.toString()
					.substring(0, 15) //extrating the date from the totol date and time and year
			}).then(attendance => {
				if (attendance) {
					const temp = attendance.students.filter(
						result =>
							result.studentDetail.toString() === req.user._id.toString()
					)[0];

					if (temp) {
						const bodya = {
							types: req.body.type,
							timing: Date().toString()
						};
						temp.checking.push(bodya); //pushing the obect to the exiting obect
					} else {
						const checking = [
							{
								types: req.body.type,
								timing: Date()
									.toString()
									.substring(0, 15) //extrating the date from the totol date and time and year
							}
						];

						const student = {
							studentDetail: req.user._id,
							checking
						};
						attendance.students.push(student); //pushing the new student to the array
						attendance.save().then(result => res.send(result));
						return;
					}
					attendance.save().then(result => res.send(result));
				} else {
					//creating the new Attendance obect
					const checking = [
						{
							types: req.body.type
						}
					];
					const students = [
						{
							studentDetail: req.user._id,
							checking
						}
					];
					const body = {
						date: Date()
							.toString()
							.substring(0, 15),
						students
					};
					const attendance = new Attendance(body);
					attendance.save().then(result => res.json(result));
				}
			});
		}
		creatAttendance();
	}
);

//routes for getting the attedance details
router.get(
	"/attendance",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		async function Get() {
			Attendance.findOne({
				date: Date()
					.toString()
					.substring(0, 15)
			}).then(result => {
				if (result) {
					const mm = result.students;
					result2 = mm.filter(
						rem => rem.studentDetail.toString() == req.user._id.toString() //filering the current student from all student
					);
					res.send(result2[0]);
				}
			});
		}
		Get();
	}
);

//routes for adding the warden
router.post(
	"/addWarden",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Student.findById(req.user._id).then(user => {
			if (user) {
				Warden.findOne({ employeeId: req.body.employeeId }).then(warden => {
					user.warden = warden._id;
					user
						.save()
						.then(user => res.json(warden))
						.catch(err => console.log(err));
				});
			}
		});
	}
);

//routes for adding the security Guard
router.post(
	"/addSecurityGuard",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Student.findById(req.user._id).then(user => {
			if (user) {
				SecurityGuard.findOne({ employeeId: req.body.employeeId }).then(
					SecurityGuard => {
						user.securityGuard = SecurityGuard._id;
						user
							.save()
							.then(user => res.json(user))
							.catch(err => console.log(err));
					}
				);
			}
		});
	}
);

//Routes for Creating the Food Pass
router.post(
	"/food",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Student.findById(req.user._id).then(user => {
			if (user) {
				user.Token = Date.now();
				user.save().then(result => res.send(result));
			}
		});
	}
);

//Routes for Getting the Food pass
router.get(
	"/food",
	passport.authenticate("jwt", { session: false }), //authorization of the routes
	(req, res) => {
		async function Get() {
			Student.findById(req.user._id).then(result => res.json(result));
		}
		Get();
	}
);

module.exports = router;
