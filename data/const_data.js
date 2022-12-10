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

function getLocalTime(now, timeZone_fn) {
	// get current time in UTC
	//	const now = new Date();
	// if (!timeZone_fn) {
	// 	let timeZone_fn = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];
	// }

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

const localDateTime = getLocalTime(new Date());

module.exports = {
	collegeList,
	localDateTime,
	getLocalTime,
};
