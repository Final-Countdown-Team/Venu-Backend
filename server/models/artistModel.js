import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

import { hasingPassword } from "../utils/hasingPassword.js";

const artistSchema = mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide a name"],
		trim: true,
	},
	email: {
		type: String,
		required: [true, "Please provide an email"],
		unique: true,
		lowercase: true,
		validator: [validator.isEmail, "Please provide a valid email"],
	},
	emailConfirmed: {
		type: Boolean,
		default: false,
	},
	password: {
		type: String,
		required: [true, "Please provide a password"],
		minlength: 4,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, "Please confirm your password"],
		validate: {
			// This only works on CREATE and SAVE!!!
			validator: function (el) {
				return el === this.password;
			},
			message: "Passwords are not the same!",
		},
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
	role: {
		type: String,
		required: [true, "Please provide a role"],
	},
	genre: {
		type: String,
		required: [true, "Please provide a genre"],
	},
	address: {
		street: {
			type: String,
			required: [true, "Please provide a street"],
		},
		city: {
			type: String,
			required: [true, "Please provide a city"],
		},
		zipcode: {
			type: String,
			required: [true, "Please provide a zip"],
		},
	},
	medialLinks: {
		facebookUrl: {
			type: String,
			required: [true, "Please provide a facebook"],
		},
		twitterUrl: {
			type: String,
			required: [true, "Please provide a twitter"],
		},
		instagramUrl: {
			type: String,
			required: [true, "Please provide a instagram"],
		},
		youtubeUrl: {
			type: String,
			required: [true, "Please provide a youtube"],
		},
	},
	imageUrl: {
		type: String,
		required: [true, "Please provide an image"],
	},
	albums: [
		{
			albumId: String,
		},
	],
	description: {
		type: String,
		required: [true, "Please provide a description"],
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
});

artistSchema.pre("save", async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified("password")) return next();

	// Hash the password with cost of 12
	this.password = await hasingPassword(this.password);
	this.passwordConfirm = undefined;
	next();
});

// Update passwordChangedAt property for the user
artistSchema.pre("save", function (next) {
	if (!this.isModified("password") || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// Query middleware
artistSchema.pre(/^find/, function (next) {
	// this points to the current query
	this.find({ active: { $ne: false } });
	next();
});

// Instance method
artistSchema.methods.correctPassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.Password);
};

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;
