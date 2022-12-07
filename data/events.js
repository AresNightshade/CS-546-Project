const helpers = require('../../helpers');
const mongoCollections = require('../config/mongoCollections');
const user_collection = mongoCollections.user_collection;
const event_collection = mongoCollections.event_collection;

const createEvent = async (
	eventName,
	location,
	startTime,
	endTime,
	postedBy,
	tags,
	description,
	capacity,
	college
) => {
	//
	const event_collection_c = await event_collection();
	const user_collection_c = await user_collection();

	helpers.errorIfNotProperString(eventName, 'eventName');
	helpers.errorIfNotProperString(location, 'location');
	helpers.errorIfNotProperDateTime(startTime);
	helpers.errorIfNotProperDateTime(endTime);
	if (Date.parse(startTime) >= Date.parse(startTime)) {
		throw `StartTime can't after endTime`;
	}

	//check if user exists
	helpers.errorIfNotProperUserName(postedBy, 'postedBy');
	postedBy = postedBy.trim();
	let user = await user_collection_c.findOne({ userName: postedBy });
	if (!user) throw `No user present with userName: ${postedBy}`;

	helpers.errorIfNotProperString(tags, 'Tags');
	tags = tags.split(',');
	helpers.errorIfNotProperString(description, 'description');
	helpers.errorIfNotProperString(college, 'college');

	helpers.errorIfStringIsNotNumber(capacity);
	capacity = parseFloat(capacity);

	if (capacity < 1 || capacity % 1 > 0) {
		throw `Invalid Capacity provided`;
	}

	let new_event = {
		eventName: eventName,
		location: location,
		startTime: startTime,
		endTime: endTime,
		favoriteEvents: [],
		eventsRegistered: [],
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
	} else {
		return { eventInserted: true };
	}
};
