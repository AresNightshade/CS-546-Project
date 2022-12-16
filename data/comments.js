const { ObjectId } = require('mongodb');

const helpers = require('../helpers');
const eventData = require('./events');
const userData = require('./users');
const { localDateTime } = require('./const_data');

const createComment = async (eventID, userName, comment) => {
	if (!comment) throw `Comment body empty`;

	//check if event exists
	helpers.errorIfNotProperID(eventID, 'eventID');
	eventID = eventID.trim();
	let event = await eventData.getEventData(eventID);

	//check if user exists
	helpers.errorIfNotProperUserName(userName, 'userName');
	userName = userName.trim().toLowerCase();
	let user = await userData.getUserData(userName);

	let commentID = new ObjectId();
	let newComment = {
		_id: commentID,
		commentDate: new Date(),
		userName: userName,
		body: comment,
	};

	event.comments.push(newComment);
	event.comments.sort((a, b) => b.commentDate - a.commentDate);
	let updateParamter = {};
	updateParamter.comments = event.comments;
	event = await eventData.updateEvent(eventID, updateParamter);

	return newComment;
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
