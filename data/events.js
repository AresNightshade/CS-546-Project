const helpers = require('../helpers');
const users = require('./users');
const mongoCollections = require('../config/mongoCollections');
const user_collection = mongoCollections.user_collection;
const event_collection = mongoCollections.event_collection;
const { ObjectId } = require('mongodb');
const lodash = require('lodash');

const createEvent = async (
	eventName,
	location,
	startTime,
	endTime,
	postedBy,
	tags,
	description,
	capacity
) => {
	//
	const event_collection_c = await event_collection();

	helpers.errorIfNotProperString(eventName, 'eventName');
	helpers.errorIfNotProperString(location, 'location');
	helpers.errorIfNotProperDateTime(startTime);
	helpers.errorIfNotProperDateTime(endTime);
	if (Date.parse(startTime) >= Date.parse(endTime)) {
		throw `StartTime can't after endTime`;
	}

	helpers.errorIfNotProperUserName(postedBy, 'postedBy');
	postedBy = postedBy.trim();
	let user = await users.getUserData(postedBy);
	if (!user) throw `No user present with userName: ${postedBy}`;

	if (tags) {
		helpers.errorIfNotProperString(tags, 'Tags');
		//tags = tags.split(',');
	}
	helpers.errorIfNotProperString(description, 'description');

	//	helpers.errorIfNotProperString(college, 'college');
	college = user.college;

	//	helpers.errorIfStringIsNotNumber(capacity);
	//	capacity = parseFloat(capacity);

	if (capacity < 1 || capacity % 1 > 0) {
		throw `Invalid Capacity provided`;
	}

	let new_event = {
		eventName: eventName,
		location: location,
		startTime: new Date(startTime),
		endTime: new Date(endTime),
		postedBy: postedBy,
		tags: tags,
		description: description,
		capacity: capacity,
		numUserRegistered: 0,
		usersRegistered: [],
		images: [],
		college: college,
		comments: [],
	};

	const insertInfo = await event_collection_c.insertOne(new_event);

	if (insertInfo.insertedCount === 0) {
		throw `Server Error`;
	}

	let newEventId = insertInfo.insertedId.toString();
	let event = getEventData(newEventId);

	return event;
};

const findAllEvent = async (filter, sort) => {
	//

	const event_collection_c = await event_collection();

	let filterCondition = filter ? filter : { endTime: { $gt: new Date() } };
	let sortCondition = sort ? sort : { startTime: 1, endTime: -1 };
	let eventList = await event_collection_c
		.find(filterCondition)
		.sort(sortCondition)
		.toArray();
	eventList = eventList.map(function (val) {
		val['_id'] = val['_id'].toString();
		return val;
	});

	return eventList;
};

const getEventData = async (eventID) => {
	//
	try {
		helpers.errorIfNotProperID(eventID, 'eventID');
	} catch (e) {
		throw `Incorrect eventID`;
	}

	const event_collection_c = await event_collection();
	let event = await event_collection_c.findOne({ _id: ObjectId(eventID) });
	if (!event) throw `Event not present`;

	return event;
};

const registerForEvent = async (eventID, userName) => {
	//
	helpers.errorIfNotProperID(eventID);
	helpers.errorIfNotProperUserName(userName);
	userName = userName.toLowerCase();
	let user = await users.getUserData(userName);
	let event = await getEventData(eventID);

	if (event.usersRegistered.includes(userName)) {
		throw `Already registered for the Event`;
	}

	let capacityLeft = event.numUserRegistered >= event.capacity ? false : true;
	if (!capacityLeft) {
		throw 'Sorry! but the event is at full capacity';
	}

	event.usersRegistered.push(userName);
	event.numUserRegistered = event.numUserRegistered + 1;

	//check if user can register for the event
	let userEventsRegistered = user.eventsRegistered;

	let conflictEventList = [];
	const event_collection_c = await event_collection();
	conflictEventList = await event_collection_c
		.find({
			$and: [
				{
					_id: {
						$in: userEventsRegistered,
					},
				},
				{
					$or: [
						{
							startTime: {
								$gte: event.startTime,
								$lt: event.endTime,
							},
						},
						{
							endTime: {
								$gt: event.startTime,
								$lte: event.endTime,
							},
						},
						{
							$and: [
								{
									startTime: {
										$lt: event.startTime,
									},
								},
								{
									endTime: {
										$gt: event.endTime,
									},
								},
							],
						},
					],
				},
			],
		})
		.toArray();

	if (conflictEventList.length !== 0) {
		throw `You can't register for conflicting events`;
	}

	//update Event
	let updateParamter = {};
	updateParamter.usersRegistered = event.usersRegistered;
	updateParamter.numUserRegistered = event.numUserRegistered;

	event = await updateEvent(eventID, updateParamter);

	//update User
	user.eventsRegistered.push(event._id.toString());
	updateParamter = {};
	updateParamter.eventsRegistered = user.eventsRegistered;

	let new_user = await users.updateUser(userName, updateParamter);
	return event;
};

const deRegisterForEvent = async (eventID, userName) => {
	//
	helpers.errorIfNotProperID(eventID);
	helpers.errorIfNotProperUserName(userName);
	userName = userName.toLowerCase();
	let user = await users.getUserData(userName);
	let event = await getEventData(eventID);

	if (!event.usersRegistered.includes(userName)) {
		throw `You Are not registered in the event`;
	}

	event.usersRegistered = event.usersRegistered.filter(function (value) {
		return value != userName;
	});
	event.numUserRegistered = event.numUserRegistered - 1;

	//update Event
	let updateParamter = {};
	updateParamter.usersRegistered = event.usersRegistered;
	updateParamter.numUserRegistered = event.numUserRegistered;
	event = await updateEvent(eventID, updateParamter);

	//update User
	user.eventsRegistered = user.eventsRegistered.filter(function (value) {
		return value != event._id.toString();
	});
	updateParamter = {};
	updateParamter.eventsRegistered = user.eventsRegistered;

	let new_user = await users.updateUser(userName, updateParamter);
	return event;
};

const updateEvent = async (eventID, updateParamter) => {
	helpers.errorIfNotProperID(eventID);
	let old_event = await getEventData(eventID);
	let new_event = lodash.cloneDeep(old_event);

	if (updateParamter.startTime) throw `Can't update start time of the Event`;
	if (updateParamter.endTime) throw `Can't update end time of the Event`;

	if (
		'capacity' in updateParamter &&
		updateParamter.capacity < old_event.numUserRegistered
	) {
		throw `Can't reduce the capacity below count of currently registered Event `;
	}

	if (
		'capacity' in updateParamter &&
		(updateParamter.capacity < 1 || updateParamter.capacity % 1 > 0)
	) {
		throw `Invalid Capacity provided`;
	}

	let anyUpdate = false;

	for (const key in old_event) {
		if (key in updateParamter) {
			if (
				typeof updateParamter[key] === typeof old_event[key] &&
				!lodash.isEqual(updateParamter[key], old_event[key])
			) {
				anyUpdate = true;
				new_event[key] = updateParamter[key];
			}
		}
	}
	if (!anyUpdate) throw 'No Event parameter updated';

	helpers.errorIfNotProperString(new_event.eventName, 'eventName');
	helpers.errorIfNotProperString(new_event.location, 'location');
	// if (new_event.tags) {
	// 	helpers.errorIfNotProperString(new_event.tags, 'Tags');
	// 	//		tags = tags.split(',');
	// }
	helpers.errorIfNotProperString(new_event.description, 'description');

	const event_collection_c = await event_collection();
	const updatedInfo = await event_collection_c.updateOne(
		{ _id: ObjectId(eventID) },
		{ $set: new_event }
	);

	if (updatedInfo.modifiedCount === 0) {
		throw 'Could not Update event successfully';
	}

	new_event = await getEventData(eventID);
	return new_event;
};

module.exports = {
	createEvent,
	findAllEvent,
	getEventData,
	registerForEvent,
	updateEvent,
	deRegisterForEvent,
};
