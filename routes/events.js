//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const eventData = data.events;
const userData = data.users;
const { collegeList } = data;
const { localDateTime } = data;

router.route('/').get(async (req, res) => {
	//code here for GET
	let filter = { endTime: { $gt: new Date() } };
	if (req.session.user) {
		let user = await userData.getUserData(req.session.user);
		filter.college = user.college;
		let eventList = await eventData.findAllEvent(filter);

		res.render('homePage', {
			title: 'RSVP',
			eventList: eventList,
			userPresent: true,
			userName: req.session.user,
		});
	} else {
		let eventList = await eventData.findAllEvent(filter);
		res.render('homePage', {
			title: 'RSVP',
			userPresent: false,
			eventList: eventList,
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
			const minDateTimeString = minDateTime.toISOString().substr(0, 16);

			res.render('createEvent', {
				title: 'Create Event',
				pageName: 'createEvent',
				minDateTimeString: minDateTimeString,
			});
		} else {
			res.render('createEventNoUser', { title: 'Create Event' });
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
				res.render('createEventNoUser', { title: 'Not Authorized' });
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
module.exports = router;
