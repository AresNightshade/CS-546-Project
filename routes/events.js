//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const eventData = data.events;

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
			res.render('createEvent', { title: 'Create Event' });
		} else {
			res.render('createEventNoUser', { title: 'Create Event' });
		}
	})
	.post(async (req, res) => {
		//
		if (req.session.user) {
			let eventName = req.body.eventNameInput;
			let location = req.body.locationInput;
			let startTime = req.body.startTimeInput;
			let endTime = req.body.endTimeInput;
			let tags = req.body.tagsInput;
			let description = req.body.descriptionInput;
			let capacity = req.body.capacityInput;
			let image = req.body.image;
			await eventData.createEvent(
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
		} else {
			res.render('createEventNoUser', { title: 'Create Event' });
		}
	});
module.exports = router;
