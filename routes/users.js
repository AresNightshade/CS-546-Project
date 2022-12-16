//require express, express router and bcrypt as shown in lecture code
const express = require('express');
const router = express.Router();
const helpers = require('../helpers');
const data = require('../data');
const usersData = data.users;
const { collegeList } = data;
const { localDateTime } = data;
const xss = require('xss');
router
	.route('/login')
	.get(async (req, res) => {
		//code here for GET

		if (req.session.user) {
			return res.redirect('/');
		} else {
			res.render('userLogin', { title: 'Login', pageName: 'userLogin' });
		}
	})
	.post(async (req, res) => {
		//code here for POST
		if (req.session.user) {
			return res.redirect('/');
		} else {
			let userName = xss(req.body.usernameInput);
			let password = xss(req.body.passwordInput);
			try {
				helpers.errorIfNotProperUserName(userName, 'usernames');
				helpers.errorIfNotProperPassword(password, 'password');
				userName = userName.toLowerCase();
				let result = await usersData.checkUser(userName, password);

				if (result.authenticatedUser) {
					req.session.user = userName;
					return res.redirect('/');
				} else {
					res.status(500).render('userLogin', {
						title: 'Login',
						pageName: 'userLogin',
						error: true,
						error_message: `Internal Server Error`,
					});
				}
			} catch (e) {
				res.status(400).render('userLogin', {
					title: 'Login',
					pageName: 'userLogin',
					error: true,
					error_message: `Either the username or password is invalid`,
				});
			}
		}
	});

router
	.route('/register')
	.get(async (req, res) => {
		//code here for GET
		if (req.session.user) {
			return res.redirect('/');
		} else {
			res.render('userRegister', {
				title: 'Register',
				pageName: 'userRegister',
				collegeList: collegeList,
			});
		}
	})
	.post(async (req, res) => {
		//code here for POST
		if (req.session.user) {
			return res.redirect('/');
		} else {
			let userName = xss(req.body.usernameInput);
			let password = xss(req.body.passwordInput);

			let firstName = xss(req.body.firstNameInput);
			let lastName = xss(req.body.lastNameInput);
			let college = xss(req.body.collegeNameInput);

			try {
				helpers.errorIfNotProperUserName(userName, 'usernames');
				helpers.errorIfNotProperPassword(password, 'password');
				userName = userName.toLowerCase();
				let result = await usersData.createUser(
					userName,
					password,
					firstName,
					lastName,
					college
				);

				return res.redirect('/user/login');
			} catch (e) {
				res.status(400).render('userRegister', {
					title: 'Register',
					pageName: 'userRegister',
					collegeList: collegeList,
					error: true,
					error_message: e,
					userName: userName,
					firstName: firstName,
					lastName: lastName,
					college: college,
				});
			}
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
