//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const usersData = data.users;

router.route('/').get(async (req, res) => {
	//code here for GET
	res.render('Temp', { title: 'Home' });
});
module.exports = router;
