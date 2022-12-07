//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const usersData = data.users;

router
	.route('/login')
	.get(async (req, res) => {
		//code here for GET
		if (req.session.user) {
			return res.redirect('/');
		} else {
			res.render('userLogin', { title: 'Login' });
		}
	})
	.post(async (req, res) => {
		//code here for POST
		let userName = req.body.usernameInput;
		let password = req.body.passwordInput;
		try {
			helpers.errorIfNotProperUserName(userName, 'usernames');
			helpers.errorIfNotProperPassword(password, 'password');
			let result = await usersData.checkUser(userName, password);

			if (result.authenticatedUser) {
				req.session.user = userName;
				return res.redirect('/');
			} else {
				res.status(500).render('userLogin', {
					title: 'Login',
					error: true,
					error_message: `Internal Server Error`,
				});
			}
		} catch (e) {
			res.status(400).render('userLogin', {
				title: 'Login',
				error: true,
				error_message: e,
			});
		}
	});

router
	.route('/register')
	.get(async (req, res) => {
		//code here for GET
		if (req.session.user) {
			return res.redirect('/');
		} else {
			res.render('userRegister', { title: 'Register' });
		}
	})
	.post(async (req, res) => {
		//code here for POST
		let userName = req.body.usernameInput;
		let password = req.body.passwordInput;
		try {
			helpers.errorIfNotProperUserName(userName, 'usernames');
			helpers.errorIfNotProperPassword(password, 'password');
			let result = await usersData.createUser(userName, password);
			if (result.userInserted) {
				return res.redirect('/');
			} else {
				res.status(500).render('userRegister', {
					title: 'Register',
					error: true,
					error_message: `Internal Server Error`,
				});
			}
		} catch (e) {
			res.status(400).render('userRegister', {
				title: 'Register',
				error: true,
				error_message: e,
			});
		}
	});

router.route('/logout').get(async (req, res) => {
	//code here for GET
	if (req.session.user) {
		res.clearCookie('AuthCookie');
		res.render('logout', { title: 'Logout' });
	} else {
		res.redirect('/');
	}
});

module.exports = router;
