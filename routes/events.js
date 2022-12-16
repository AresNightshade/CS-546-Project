//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const eventData = data.events;
const userData = data.users;
const commentData = data.comments;
const { collegeList } = data;
const { localDateTime } = data;
const { ObjectId } = require('mongodb');
const multer = require('multer');
const sharp = require('sharp');
const port = process.env.PORT || 5000;
const fs = require('fs');
const { Console } = require('console');

const upload = multer({
	limits: {
		fileSize: 5000000,
	},
	fieldName: 'image',
	fileFilter(req, file, cb) {
		if (!file.originalname.toLocaleLowerCase().match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload a valid image file'));
		}
		cb(undefined, true);
	},
});

router
	.route('/')
	.get(async (req, res) => {
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
	})
	.post(async (req, res) => {
		try {
			let filter = { endTime: { $gt: new Date() } };
			let userPresent = false;
			let userName;
			let eventFilter;
			let newPageName;
			let eventList = [];
			let searchElement = req.body.searchElement;
			searchElement = searchElement.toLocaleLowerCase().trim();
			//helpers.errorIfNotProperString(searchElement, 'Search Element');

			filter['$or'] = [
				{ description: { $regex: searchElement, $options: 'i' } },
				{ tags: { $regex: searchElement, $options: 'i' } },
				{ eventName: { $regex: searchElement, $options: 'i' } },
			];
			if (req.session.user) {
				let user = await userData.getUserData(req.session.user);
				filter.college = user.college;
				userPresent = true;
				userName = req.session.user.trim().toLowerCase();
				eventFilter = req.body.eventFilter.toLowerCase().trim();
				if (eventFilter === 'created') {
					newPageName = 'Created Events';
					filter['postedBy'] = userName;
				}
				if (eventFilter === 'registered') {
					newPageName = 'Registered Events';
					let registered_list = user.eventsRegistered;
					registered_list = registered_list.map(function (val) {
						val = ObjectId(val);
						return val;
					});
					filter['_id'] = { $in: registered_list };
				}

				if (eventFilter === 'fav') {
					newPageName = 'Favorite Events';
					let fav_list = user.favoriteEvents;
					fav_list = fav_list.map(function (val) {
						val = ObjectId(val);
						return val;
					});
					filter['_id'] = { $in: fav_list };
				}
			}
			console.log(eventFilter);
			eventList = await eventData.findAllEvent(filter);

			eventList.map((x) => (x.eventLink = '/event/' + x._id));
			res.render('homePage', {
				title: 'RSVP',
				eventList: eventList,
				newPageName: newPageName,
				pageName: 'homePage',
				userPresent: userPresent,
				userName: userName,
			});
		} catch (e) {
			res.render('homePage', {
				title: 'RSVP',
				eventList: eventList,
				pageName: 'homePage',
				userPresent: userPresent,
				userName: userName,
				error: true,
				error_message: e,
			});
		}
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
	.post(upload.single('image'), async (req, res) => {
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
				let image = false;

				try {
					helpers.errorIfNotProperString(eventName, 'eventName');
					helpers.errorIfNotProperString(location, 'location');
					helpers.errorIfNotProperDateTime(startTime);
					helpers.errorIfNotProperDateTime(endTime);

					if (req.file) {
						await sharp(req.file.buffer)
							.resize({ width: 250, height: 250 })
							.png()
							.toFile(__dirname + `/../public/uploads/image/temp_file`);
						fs.unlinkSync(__dirname + `./../public/uploads/image/temp_file`);
						image = req.file.originalname;
					} else {
						image = false;
					}
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
				if (req.file) {
					await sharp(req.file.buffer)
						.resize({ width: 250, height: 250 })
						.png()
						.toFile(
							__dirname +
								`/../public/uploads/image/${
									event._id.toString() + '_' + req.file.originalname
								}`
						);
				}
				return res.redirect('/');
			} else {
				res.render('error', {
					title: 'Not Authorized',
					head: 'Not Authorized',
					message: 'Only logged in user can create the events',
				});
			}
		} catch (e) {
			console.log(e);
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
	let eventId = req.params.eventId.trim();
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
			userFav = user.favoriteEvents.includes(eventId) ? true : false;
			userRegistered = user.eventsRegistered.includes(eventId) ? true : false;
			userName = user.username;
		}

		event = await eventData.getEventData(eventId);

		if (req.session.user) {
			if (event.postedBy.toLowerCase() === userName.toLowerCase()) {
				ownerTag = true;
				notOwnerTag = false;
			}
		}

		let capacityLeft = event.numUserRegistered >= event.capacity ? false : true;

		if (event.image) {
			event.imagePath = `/public/uploads/image/${eventId + '_' + event.image}`;
		}
		event.userPresent = userPresent;
		event.notOwnerTag = notOwnerTag;
		event.userName = userName;
		event.ownerTag = ownerTag;
		event.userFav = userFav;
		event.userRegistered = userRegistered;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventId}`;
		event.deRegisterLink = `/event/deregister/${eventId}`;
		event.eventFavLink = `/event/fav/${eventId}`;
		event.editEvent = `/event/edit/${eventId}`;
		event.deleteEvent = `/event/delete/${eventId}`;
		event.postCommentLink = `/event/postComment/${eventId}`;

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
	let eventId = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;
	let eventList = [];
	let capacityLeft;
	try {
		event = await eventData.getEventData(eventId);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventId) ? true : false;
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

		if (
			event.college.toLowerCase().trim() !== user.college.toLowerCase().trim()
		) {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: `You can't register for different college event`,
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
		await eventData.registerForEvent(eventId, userName);

		return res.redirect('/event/' + eventId);
	} catch (e) {
		//
		event.userName = userName;
		event.userPresent = userPresent;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventId}`;
		event.eventFavLink = `/event/fav/${eventId}`;
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
	let eventId = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;

	try {
		event = await eventData.getEventData(eventId);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventId) ? true : false;
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

		if (
			event.college.toLowerCase().trim() !== user.college.toLowerCase().trim()
		) {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: `You can't fav  different college event`,
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

		return res.redirect('/event/' + eventId);
	} catch (e) {
		//
		console.log(e);
		return res.redirect('/event/' + eventId);
	}
});

router.route('/event/deregister/:eventId').get(async (req, res) => {
	//
	let eventId = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;
	let eventList = [];
	let capacityLeft;
	try {
		event = await eventData.getEventData(eventId);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventId) ? true : false;
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

		if (!user.eventsRegistered.includes(eventId)) {
			throw `You Are not registered in the event`;
		}

		await eventData.deRegisterForEvent(eventId, userName);

		return res.redirect('/event/' + eventId);
	} catch (e) {
		//
		event.userName = userName;
		event.userPresent = userPresent;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventId}`;
		event.eventFavLink = `/event/fav/${eventId}`;
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
	let eventId = req.params.eventId.trim();
	let userPresent = false;
	let user;
	let event = {};
	let userFav;
	let userName;
	let eventList = [];
	let capacityLeft;
	try {
		event = await eventData.getEventData(eventId);
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userPresent = true;
			userFav = user.favoriteEvents.includes(eventId) ? true : false;
			userName = user.username;
		} else {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: 'Only logged in user can delete a event',
			});
		}

		if (event.postedBy.toLowerCase().trim() !== userName.toLowerCase().trim()) {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: `You can't delete someone else's event`,
			});
		}

		await eventData.deleteEvent(eventId);

		return res.redirect('/');
	} catch (e) {
		//
		event.userName = userName;
		event.userPresent = userPresent;
		event.capacityLeft = capacityLeft;
		event.registerLink = `/event/register/${eventId}`;
		event.eventFavLink = `/event/fav/${eventId}`;
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

router
	.route('/event/edit/:eventId')
	.get(async (req, res) => {
		//code here for GET
		let eventId = req.params.eventId.trim();
		let user;
		let event = {};
		let minCapacity;
		let userName;
		try {
			event = await eventData.getEventData(eventId);
			minCapacity = Math.max(event.numUserRegistered, 1);
			if (req.session.user) {
				user = await userData.getUserData(req.session.user);
				userName = user.username;
			} else {
				return res.render('error', {
					title: 'Not Authorized',
					head: 'Not Authorized',
					message: 'Only logged in user can edit a event',
				});
			}

			if (
				event.postedBy.toLowerCase().trim() !== userName.toLowerCase().trim()
			) {
				return res.render('error', {
					title: 'Not Authorized',
					head: 'Not Authorized',
					message: `You can't edit someone else's event`,
				});
			}
			res.render('editEvent', {
				title: 'Edit Event',
				pageName: 'editEvent',
				postLink: `/event/edit/${eventId}`,
				minCapacity: minCapacity,
			});
		} catch (e) {
			//
			return res.render('error', {
				title: 'Error',
				head: `Error`,
				message: e,
			});
		}
	})
	.post(upload.single('image'), async (req, res) => {
		//
		let eventId = req.params.eventId.trim();
		let minCapacity;
		let event;
		let user;
		try {
			if (req.session.user) {
				event = await eventData.getEventData(eventId);
				user = await userData.getUserData(req.session.user);
				let userName = user.username;
				if (
					event.postedBy.toLowerCase().trim() !== userName.toLowerCase().trim()
				) {
					return res.render('error', {
						title: 'Not Authorized',
						head: 'Not Authorized',
						message: `You can't edit someone else's event`,
					});
				}

				minCapacity = Math.max(event.numUserRegistered, 1);
				let eventName = req.body.eventNameInput;
				let location = req.body.locationInput;
				let tags = req.body.tagsInput;
				let description = req.body.descriptionInput;
				let capacity = req.body.capacityInput;
				let image = req.body.image;
				let updateParamter = {};

				if (req.file) {
					await sharp(req.file.buffer)
						.resize({ width: 250, height: 250 })
						.png()
						.toFile(
							__dirname +
								`/../public/uploads/image/${
									event._id.toString() + '_' + req.file.originalname
								}`
						);

					updateParamter.image = req.file.originalname;
				}

				if (eventName) {
					helpers.errorIfNotProperString(eventName, 'eventName');
					updateParamter.eventName = eventName;
				}

				if (description) {
					helpers.errorIfNotProperString(description, 'description');
					updateParamter.description = description;
				}
				if (tags) {
					helpers.errorIfNotProperString(tags, 'tags');
					updateParamter.tags = tags;
				}
				if (location) {
					helpers.errorIfNotProperString(location, 'location');
					updateParamter.location = location;
				}
				if (capacity) {
					helpers.errorIfStringIsNotNumber(capacity);
					capacity = parseFloat(capacity);
					if (capacity < Math.max(minCapacity, 1) || capacity % 1 > 0) {
						throw `Invalid Capacity provided`;
					}
					updateParamter.capacity = capacity;
				}

				event = await eventData.updateEvent(eventId, updateParamter);
				return res.redirect('/event/' + eventId);
			} else {
				res.render('error', {
					title: 'Not Authorized',
					head: 'Not Authorized',
					message: 'Only logged in user can edit the events',
				});
			}
		} catch (e) {
			console.log(e);
			res.render('editEvent', {
				title: 'Edit Event',
				pageName: 'editEvent',
				minCapacity: minCapacity,
				postLink: `/event/edit/${eventId}`,
				error: true,
				error_message: e,
			});
		}
	});

router.route('/event/postComment/:eventId').post(async (req, res) => {
	//
	try {
		let eventId = req.params.eventId.trim();
		let commentBody = req.body.comment;
		helpers.errorIfNotProperString(commentBody);
		let event = await eventData.getEventData(eventId);
		let userName;
		if (req.session.user) {
			user = await userData.getUserData(req.session.user);
			userName = user.username;
		} else {
			return res.render('error', {
				title: 'Not Authorized',
				head: 'Not Authorized',
				message: 'Only logged in user can comment on a event',
			});
		}
		comment = commentData.createComment(eventId, userName, commentBody);
		console.log('here');
		return res.send(comment);
	} catch (e) {
		//
		return res.send(e);
	}
});

module.exports = router;
