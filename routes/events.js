//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const eventData = data.events;
const userData = data.users;
const { collegeList } = data;
const { localDateTime } = data;
const { ObjectId } = require('mongodb');

router.route('/').get(async (req, res) => {
	//code here for GET
	let filter = { endTime: { $gt: new Date() } };
	let userPresent = false;
	let userName;
	let eventList = [];
	if (req.session.user) {
		let user = await userData.getUserData(req.session.user);
		filter.college = user.college;
		eventList = await eventData.findAllEvent(filter);
		userPresent = true;
		userName = req.session.user;
	} else {
		eventList = await eventData.findAllEvent(filter);
	}
	eventList.map((x) => (x.eventLink = '/event/' + x._id));
	res.render('homePage', {
		title: 'RSVP',
		eventList: eventList,
		pageName: 'homePage',
		userPresent: userPresent,
		userName: userName,
	});
});

router
	.route('/event/createEvent')
	.get(async (req, res) => {
		//code here for GET
		if (req.session.user) {
			//
			const now = localDateTime;
			const minDateTime = new Date(now.getTime() + 30 * 60000);
			const minDateStartTimeString = minDateTime.toISOString().substr(0, 16);
			const maxDateEndTimeString = new Date(
				now.getTime() + 365 * 24 * 60 * 60 * 1000 + 30 * 60000
			)
				.toISOString()
				.substr(0, 16);
			res.render('createEvent', {
				title: 'Create Event',
				pageName: 'createEvent',
				minDateStartTimeString: minDateStartTimeString,
				maxDateEndTimeString: maxDateEndTimeString,
			});
		} else {
			res.render('error', {
				title: 'Create Event',
				head: 'Not Authorized',
				message: 'Only logged in user can create the events',
			});
		}
	})
	.post(async (req, res) => {
		//
		try {
			if (req.session.user) {
				let eventName = req.body.eventNameInput;
				let location = req.body.locationInput;
				let startTime = req.body.startTimeInput;
				let endTime = req.body.endTimeInput;
				let tags = req.body.tagsInput;
				let description = req.body.descriptionInput;
				let capacity = req.body.capacityInput;
				let image = req.body.image;

				try {
					helpers.errorIfNotProperString(eventName, 'eventName');
					helpers.errorIfNotProperString(location, 'location');
					helpers.errorIfNotProperDateTime(startTime);
					helpers.errorIfNotProperDateTime(endTime);

					const now = localDateTime;
					const minDateTime = new Date(now.getTime() + 30 * 60000);
					const maxDateEndTime = new Date(
						now.getTime() + 365 * 24 * 60 * 60 * 1000 + 30 * 60000
					);

					if (minDateTime > new Date(startTime)) {
						throw `Event can't be created 30 min prior to start`;
					}

					if (maxDateEndTime < new Date(endTime)) {
						throw `Event can't be created 1 year before start`;
					}

					let start = new Date(startTime.value).getTime();
					let end = new Date(endTime.value).getTime();
					let diff_ms = end - start;
					let diff_days = diff_ms / (24 * 60 * 60 * 1000);

					if (diff_days < 0) {
						throw `Start time can't after End time`;
					}
					if (diff_days > 1) {
						throw `Event duration can't more than 24 hrs`;
					}

					helpers.errorIfStringIsNotNumber(capacity);
					capacity = parseFloat(capacity);

					if (capacity < 1 || capacity % 1 > 0) {
						throw `Invalid Capacity provided`;
					}
				} catch (e) {
					res.render('createEvent', {
						title: 'Create Event',
						pageName: 'createEvent',
						error: true,
						error_message: e,
					});
					return;
				}

				let event = await eventData.createEvent(
					eventName,
					location,
					startTime,
					endTime,
					req.session.user,
					tags,
					description,
					capacity,
					image
				);
				return res.redirect('/');
			} else {
				res.render('error', {
					title: 'Not Authorized',
					head: 'Not Authorized',
					message: 'Only logged in user can create the events',
				});
			}
		} catch (e) {
			res.render('createEvent', {
				title: 'Create Event',
				pageName: 'createEvent',
				error: true,
				error_message: `Internal Server Error`,
			});
		}
	});

router.route('/event/:eventId').get(async (req, res) => {
	//
	let eventID = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event;
	let userFav;
	let userRegistered;
	let userName;
	let ownerTag;
	let notOwnerTag = true;
	try {
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventID) ? true : false;
			userRegistered = user.eventsRegistered.includes(eventID) ? true : false;
			userName = user.username;
		}

		event = await eventData.getEventData(eventID);

		if (req.session.user) {
			if (event.postedBy.toLowerCase() === userName.toLowerCase()) {
				ownerTag = true;
				notOwnerTag = false;
			}
		}

		let capacityLeft = event.numUserRegistered >= event.capacity ? false : true;

		event.userPresent = userPresent;
		event.notOwnerTag = notOwnerTag;
		event.userName = userName;
		event.ownerTag = ownerTag;
		event.userFav = userFav;
		event.userRegistered = userRegistered;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventID}`;
		event.deRegisterLink = `/event/deregister/${eventID}`;
		event.eventFavLink = `/event/fav/${eventID}`;
		event.editEvent = `/event/edit/${eventID}`;
		event.deleteEvent = `/event/delete/${eventID}`;

		let eventList = [];
		eventList.push(event);

		res.render('eventPage', {
			title: event.eventName,
			eventList: eventList,
			pageName: 'eventPage',
			userName: userName,
		});
	} catch (e) {
		//
		res.json(e);
	}
});

router.route('/event/register/:eventId').get(async (req, res) => {
	//
	let eventID = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;
	let eventList = [];
	let capacityLeft;
	try {
		event = await eventData.getEventData(eventID);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventID) ? true : false;
			userName = user.username;
		} else {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: 'Only logged in user can register in the events',
			});
		}

		if (event.postedBy.toLowerCase().trim() === userName.toLowerCase().trim()) {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: `You can't register for your own event`,
			});
		}

		capacityLeft = event.numUserRegistered >= event.capacity ? false : true;

		if (!capacityLeft) {
			return res.render('error', {
				title: 'Event Full',
				head: 'Event at Capacity',
				message: 'Sorry! but the event is at full capacity',
			});
		}
		await eventData.registerForEvent(eventID, userName);

		return res.redirect('/event/' + eventID);
	} catch (e) {
		//
		event.userName = userName;
		event.userPresent = userPresent;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventID}`;
		event.eventFavLink = `/event/fav/${eventID}`;
		event.error_message = e;
		event.error = true;

		event.eventList = [];
		eventList.push(event);

		res.render('eventPage', {
			title: event.eventName,
			eventList: eventList,
			pageName: 'eventPage',
		});
	}
});

router.route('/event/fav/:eventId').get(async (req, res) => {
	//
	let eventID = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;

	try {
		event = await eventData.getEventData(eventID);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventID) ? true : false;
			userName = user.username;
		} else {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: 'Only logged in user can favorite a the events',
			});
		}

		if (event.postedBy.toLowerCase().trim() === userName.toLowerCase().trim()) {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: `You can't set your own event as favorite`,
			});
		}

		let updateParamter = {};
		if (userFav) {
			//update User
			user.favoriteEvents = user.favoriteEvents.filter(function (value) {
				return value != event._id.toString();
			});
		} else {
			user.favoriteEvents.push(event._id.toString());
		}

		updateParamter.favoriteEvents = user.favoriteEvents;
		await userData.updateUser(userName, updateParamter);

		return res.redirect('/event/' + eventID);
	} catch (e) {
		//
		console.log(e);
		return res.redirect('/event/' + eventID);
	}
});

router.route('/event/deregister/:eventId').get(async (req, res) => {
	//
	let eventID = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;
	let eventList = [];
	let capacityLeft;
	try {
		event = await eventData.getEventData(eventID);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventID) ? true : false;
			userName = user.username;
		} else {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: 'Only logged in user can deregister in the events',
			});
		}

		if (event.postedBy.toLowerCase().trim() === userName.toLowerCase().trim()) {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: `You can't de-register for your own event`,
			});
		}

		if (!user.eventsRegistered.includes(eventID)) {
			throw `You Are not registered in the event`;
		}

		await eventData.deRegisterForEvent(eventID, userName);

		return res.redirect('/event/' + eventID);
	} catch (e) {
		//
		event.userName = userName;
		event.userPresent = userPresent;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventID}`;
		event.eventFavLink = `/event/fav/${eventID}`;
		event.error_message = e;
		event.error = true;

		event.eventList = [];
		eventList.push(event);

		res.render('eventPage', {
			title: event.eventName,
			eventList: eventList,
			pageName: 'eventPage',
		});
	}
});

router.route('/event/delete/:eventId').get(async (req, res) => {
	//
	let eventID = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;
	let eventList = [];
	let capacityLeft;
	try {
		event = await eventData.getEventData(eventID);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventID) ? true : false;
			userName = user.username;
		} else {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: 'Only logged in user can register in the events',
			});
		}

		if (event.postedBy.toLowerCase().trim() !== userName.toLowerCase().trim()) {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: `You can't delete someone else's event`,
			});
		}

		await eventData.deleteEvent(eventID);

		return res.redirect('/');
	} catch (e) {
		//
		event.userName = userName;
		event.userPresent = userPresent;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventID}`;
		event.eventFavLink = `/event/fav/${eventID}`;
		event.error_message = e;
		event.error = true;

		event.eventList = [];
		eventList.push(event);

		res.render('eventPage', {
			title: event.eventName,
			eventList: eventList,
			pageName: 'eventPage',
		});
	}
});
module.exports = router;
