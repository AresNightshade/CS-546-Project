const mongoCollections = require('../config/mongoCollections');
const user_collection = mongoCollections.user_collection;
const event_collection = mongoCollections.event_collection;
const { ObjectId } = require('mongodb');

const helpers = require('../helpers');
const eventData = require('./events');
const { localDateTime } = require('./const_data');

const createComment = async (eventID, userID, comment) => {
	const user_collection_c = await user_collection();
	const event_collection_c = await event_collection();

	if (!comment) throw `Comment body empty`;

	//check if event exists
	helpers.errorIfNotProperID(eventID, 'eventID');
	eventID = eventID.trim();
	let event = await event_collection_c.findOne({ _id: ObjectId(eventID) });
	if (!event) throw `No Event present with id: ${eventID}`;

	//check if user exists
	helpers.errorIfNotProperID(userID, 'userID');
	userID = userID.trim();
	let user = await user_collection_c.findOne({ _id: ObjectId(userID) });
	if (!user) throw `No user present with id: ${userID}`;

	//from stack overflow

	// let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
	// let localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, -1);
	// let commentDate = localISOTime;

	let commentID = new ObjectId();
	let newReview = {
		_id: commentID,
		commentDate: new Date(),
		userID: userID,
		body: comment,
	};

	let res = await event_collection_c.updateOne(
		{ _id: ObjectId(eventID) },
		{ $push: { comment: newReview } }
	);
};

const getAllCommentForEvent = async (eventID) => {
	const event_collection_c = await event_collection();

	//check if event exists
	helpers.errorIfNotProperID(eventID, 'eventID');
	eventID = eventID.trim();
	let event = await event_collection_c.findOne({ _id: ObjectId(eventID) });
	if (!event) throw `No Event present with id: ${eventID}`;

	let commentList = event.comment;
	commentList = commentList.map(function (val) {
		val._id = val._id.toString();
		return val;
	});

	return commentList;
};

module.exports = { createComment, getAllCommentForEvent };
