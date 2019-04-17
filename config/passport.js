// This page for the Validation of Password Startegy

//Importing the Packages modules
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");

//importing the Database models from model Folder
const Student = require("../models/student");
const warden = require("../models/warden");
const Parent = require("../models/parents");
const Mentor = require("../models/mentor");
const SecurityGuard = require("../models/securityGuard");
const keys = require("../config/keys");

//Creation of Tokens
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

//Exporting the Matched Tokens
module.exports = passport => {
	passport.use(
		new JwtStrategy(opts, (jwt_payload, done) => {
			//for students
			if (jwt_payload.type == "student") {
				Student.findById(jwt_payload.id)
					.then(user => {
						if (user) {
							return done(null, user);
						}
						return done(null, false);
					})
					.catch(err => console.log(err));
			}
			//for Wardens
			if (jwt_payload.type == "warden") {
				warden
					.findById(jwt_payload.id)
					.then(user => {
						if (user) {
							return done(null, user);
						}
						return done(null, false);
					})
					.catch(err => console.log(err));
			}
			//for Parents
			if (jwt_payload.type == "parent") {
				Parent.findById(jwt_payload.id)
					.then(user => {
						if (user) {
							return done(null, user);
						}
						return done(null, false);
					})
					.catch(err => console.log(err));
			}
			//for Mentors
			if (jwt_payload.type == "mentor") {
				Mentor.findById(jwt_payload.id)
					.then(user => {
						if (user) {
							return done(null, user);
						}
						return done(null, false);
					})
					.catch(err => console.log(err));
			}
			//for the security guard
			if (jwt_payload.type == "securityGuard") {
				SecurityGuard.findById(jwt_payload.id)
					.then(user => {
						if (user) {
							return done(null, user);
						}
						return done(null, false);
					})
					.catch(err => console.log(err));
			}
		})
	);
};
