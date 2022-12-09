//Here you will require data files and export them as shown in lecture code and worked in previous labs.
const users = require('./users');
const comments = require('./comments');
const events = require('./events');
const { collegeList } = require('./const_data');

module.exports = {
	users,
	comments,
	events,
	collegeList,
};
