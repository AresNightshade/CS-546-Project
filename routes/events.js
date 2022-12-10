//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const eventData = data.events;
const { collegeList } = data;
const { localDateTime } = data;

router.route('/').get(async (req, res) => {
	//code here for GET
	res.render('Temp', { title: 'Event Registration Portal' });
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
					if (Date.parse(startTime) >= Date.parse(endTime)) {
						throw `StartTime can't after endTime`;
					}
					helpers.errorIfStringIsNotNumber(capacity);
					capacity = parseFloat(capacity);

					if (capacity < 1 || capacity % 1 > 0) {
						throw `Invalid Capacity provided`;
					}
				} catch (e) {
					res.render('createEvent', {
						title: 'Create Event',
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
			console.log(e);
			res.render('createEvent', {
				title: 'Create Event',
				error: true,
				error_message: `Internal Server Error`,
			});
		}
	});
module.exports = router;
