const mongoCollections = require('../config/mongoCollections');
const helpers = require('../helpers');
const user_collection = mongoCollections.user_collection;
const bcrypt = require('bcrypt');
const saltRounds = 12;

const createUser = async (username, password, firstName, lastName, college) => {
	helpers.errorIfNotProperUserName(username, 'usernames');
	helpers.errorIfNotProperPassword(password, 'password');
	helpers.errorIfNotProperName(firstName, 'firstName');
	helpers.errorIfNotProperName(lastName, 'lastName');

	username.trim();
	password.trim();

	username = username.toLowerCase();

	const user_collection_c = await user_collection();

	//duplicate check
	let dup_user = await user_collection_c.findOne({ username: username });

	if (dup_user) {
		throw `there is already a user with that username`;
	}

	let hashed_password = await bcrypt.hash(password, saltRounds);

	let new_user = {
		username: username,
		password: hashed_password,
		firstName: firstName,
		lastName: lastName,
		college: college,
		favoriteEvents: [],
		eventsRegistered: [],
	};

	const insertInfo = await user_collection_c.insertOne(new_user);

	if (insertInfo.insertedCount === 0) {
		throw `Server Error`;
	} else {
		return { userInserted: true };
	}
};

const checkUser = async (username, password) => {
	//
	try {
		helpers.errorIfNotProperUserName(username, 'usernames');
	} catch (e) {
		throw `Either the username or password is invalid`;
	}

	try {
		helpers.errorIfNotProperPassword(password, 'password');
	} catch (e) {
		throw `Either the username or password is invalid`;
	}

	const user_collection_c = await user_collection();
	username = username.toLowerCase();
	let user = await user_collection_c.findOne({ username: username });
	if (!user) throw `Either the username or password is invalid`;

	if (await bcrypt.compare(password, user.password)) {
		return { authenticatedUser: true };
	} else {
		throw `Either the username or password is invalid`;
	}

	return user;
};

const getUserData = async (username) => {
	//
	try {
		helpers.errorIfNotProperUserName(username, 'usernames');
	} catch (e) {
		throw `Incorrect username`;
	}

	const user_collection_c = await user_collection();
	username = username.toLowerCase();
	let user = await user_collection_c.findOne({ username: username });
	if (!user) throw `User not present`;

	return user;
};

module.exports = { createUser, checkUser, getUserData };
