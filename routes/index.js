//Here you will require route files and export the constructor method as shown in lecture code and worked in previous labs.

const user = require('./users');
const event = require('./events');

const constructorMethod = (app) => {
	app.use('/user', user);
	app.use('/', event);

	app.use('*', (req, res) => {
		return res.redirect('/');
	});
};

module.exports = constructorMethod;
