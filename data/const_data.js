const collegeList = [
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

function getCurrentTime(timeZone) {
	// get current time in UTC
	const now = new Date();

	// calculate time zone offset, in minutes, from UTC
	const timeZoneOffset = -now.getTimezoneOffset();

	// calculate time zone offset, in milliseconds, from UTC
	const timeZoneOffsetMs = timeZoneOffset * 60000;

	// get time value, in milliseconds, for desired time zone
	const timeZoneTime = now.getTime() + timeZoneOffsetMs;

	// create date object for desired time zone
	const localTime = new Date(timeZoneTime);

	// return formatted time string
	return localTime;
}

const now = new Date();
const timeZone = now.toString().match(/\(([A-Za-z\s].*)\)/)[1];
const localDateTime = getCurrentTime(timeZone);

module.exports = {
	collegeList,
	localDateTime,
};
