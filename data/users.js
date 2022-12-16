const mongoCollections = require('../config/mongoCollections');
const helpers = require('../helpers');
const user_collection = mongoCollections.user_collection;
const bcrypt = require('bcrypt');
const saltRounds = 12;
const { collegeList } = require('./const_data');
const lodash = require('lodash');

const createUser = async (username, password, firstName, lastName, college) => {
	helpers.errorIfNotProperUserName(username, 'usernames');
	helpers.errorIfNotProperPassword(password, 'password');
	helpers.errorIfNotProperName(firstName, 'firstName');
	helpers.errorIfNotProperName(lastName, 'lastName');

	let correct_college = false;
	for (var i = 0; i < collegeList.length; i++) {
		let coll = collegeList[i].college;
		if (coll == college) {
			correct_college = true;
			break;
		}
	}
	if (correct_college == false) throw `Incorrect College Name Entered`;

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
	let user = getUserData(username);

	if (insertInfo.insertedCount === 0) {
		throw `Server Error`;
	} else {
		return user;
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
		return { authenticatedUser: true, user: user };
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

const updateUser = async (userName, updateParamter) => {
	helpers.errorIfNotProperUserName(userName);
	userName = userName.toLowerCase();
	let old_user = await getUserData(userName);
	let new_user = lodash.cloneDeep(old_user);

	if (updateParamter.username) throw `Can't update username of the User`;
	if (updateParamter.password) throw `Can't update password of the User`;

	let anyUpdate = false;
	for (const key in old_user) {
		if (key in updateParamter) {
			if (
				typeof updateParamter[key] === typeof old_user[key] &&
				!lodash.isEqual(updateParamter[key], old_user[key])
			) {
				anyUpdate = true;
				new_user[key] = updateParamter[key];
			}
		}
	}
	if (!anyUpdate) throw 'No user parameter updated';

	const user_collection_c = await user_collection();
	const updatedInfo = await user_collection_c.updateOne(
		{ username: userName },
		{ $set: new_user }
	);

	if (updatedInfo.modifiedCount === 0) {
		throw 'Could not update user successfully';
	}

	new_user = await getUserData(userName);
	return new_user;
};
module.exports = { createUser, checkUser, getUserData, updateUser };
