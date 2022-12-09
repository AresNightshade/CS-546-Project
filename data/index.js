//Here you will require data files and export them as shown in lecture code and worked in previous labs.
const users = require('./users');
const comments = require('./comments');
const events = require('./events');

const college_list = [
	{
		college: 'Stevens Institute of Technology',
	},
	{
		college: 'New York University',
	},
	{
		college: 'Rutgers University',
	},
];
module.exports = {
	users,
	comments,
	events,
	college_list,
};
