const data = require('./data');
const eventData = data.events;
const userData = data.users;
const commentData = data.comments;
const collegeList = data.collegeList;
const connection = require('./config/mongoConnection');
const { ObjectId } = require('mongodb');

async function main() {
	//
	const db = await connection.dbConnection();
	await db.dropDatabase();
	let u1 = await userData.createUser(
		'Farhan',
		'Hello@123',
		'Farhan',
		'Ali',
		collegeList[0].college
	);

	let u2 = await userData.createUser(
		'Rishabh',
		'Hello@123',
		'Rishabh',
		'Goyal',
		collegeList[0].college
	);

	let u3 = await userData.createUser(
		'Rachna',
		'Hello@123',
		'Rachna',
		'Zha',
		collegeList[0].college
	);

	let u4 = await userData.createUser(
		'Ashay',
		'Hello@123',
		'Ashay',
		'Pable',
		collegeList[0].college
	);

	let u5 = await userData.createUser(
		'Rohit',
		'Hello@123',
		'Rohit',
		'Sharma',
		collegeList[1].college
	);

	let u6 = await userData.createUser(
		'Yash',
		'Hello@123',
		'Yash',
		'Baleri',
		collegeList[1].college
	);

	let u7 = await userData.createUser(
		'Deepali',
		'Hello@123',
		'Deepali',
		'Sharma',
		collegeList[1].college
	);

	let u8 = await userData.createUser(
		'Kartik',
		'Hello@123',
		'Kartik',
		'Gaglani',
		collegeList[2].college
	);

	let e1 = await eventData.createEvent(
		'Yarncraft Tea Party',
		'UCC South Tower',
		'2022-12-25T08:30',
		'2022-12-25T10:30',
		u1.username.toLowerCase(),
		'Fun, Relax',
		`Please come by to the 2nd floor of the UCC South Tower for an end of semester Tea Party!. We will have tea and knitting/crochet supplies available, come by with your Work in Progress to relax and de-stress. A crochet prize, light snacks, free knitting and crochet supplies and free spider plants (subject to availability!).`,
		2
	);

	let e2 = await eventData.createEvent(
		'Weekly Group Run',
		'Babbio Patio',
		'2022-12-25T08:30',
		'2022-12-25T10:30',
		u1.username.toLowerCase(),
		'Health, Exercise',
		`Join the Stevens Running Club for our weekly group run! Runners of any experience are welcome. We break into a number of groups, usually with one longer distance run (4 miles) and then a slower, shorter distance group (1-2 miles). Join whichever group you feel most comfortable with. We'd love to run with you!`,
		1
	);

	let e3 = await eventData.createEvent(
		'Snacks for Quacks',
		'UCC 2nd Floor Commons',
		'2022-12-28T08:30',
		'2022-12-28T10:30',
		u3.username.toLowerCase(),
		'Food, Relax',
		`Take a quick break from studying and stop by the UCC 2nd Floor Commons on Thursday, December 15th from 1-3pm and Monday, December 19th from 11am-1pm for some snacks!`,
		50
	);

	let e4 = await eventData.createEvent(
		'SCDT weekly GBM',
		'EAS 330',
		'2022-12-28T09:30',
		'2022-12-28T15:30',
		u3.username.toLowerCase(),
		'Tech, Computer, Relax',
		`Come hang out and learn more about Cyber Security with us! Join the discord if you have any questions!`,
		50
	);

	let e5 = await eventData.createEvent(
		'Revolution Noodle',
		'UCC Marketplace',
		'2022-12-28T09:30',
		'2022-12-28T15:30',
		u5.username.toLowerCase(),
		'Food, Relax',
		`Keep Calm, we have ramen! Revolution Noodle is a new and innovative Rotating Concept coming to the UCC Marketplace. Get ready this semester for bowls full of flavor served with a side of fun from December 6 to December 18. `,
		50
	);

	let e6 = await eventData.createEvent(
		'Stress Less with the Library Pets',
		'Samuel C. Williams Library',
		'2022-12-28T12:30',
		'2022-12-28T15:30',
		u5.username.toLowerCase(),
		'Stres, Exam, Relax',
		`​​The staff of the Samuel C. Williams Library and our pets are here for you during finals! Submit your contact info or that of someone you know who needs a lift during finals on the Message from the Library Pets form to get a special message from the Library staff’s cats and dogs.`,
		50
	);

	let e7 = await eventData.createEvent(
		'Big Snow Boarding',
		'1 American Dream Wy, East Rutherford',
		'2022-12-28T18:30',
		'2022-12-28T19:30',
		u5.username.toLowerCase(),
		'Stres, Exam, Relax, sport',
		`Join Graduate Student Life for The Big Snow Boarding @ American Dream Mall

        Event Details: Big SNOW American Dream, North America’s first and only indoor, year-round, real-snow ski and snowboard resort. Big because it’s a big place and it’s big fun for everyone. I mean how can anyone not have fun at a place that is Winter, all year round? And SNOW because, well, we have lots of it. Even when there’s none outside.`,
		50
	);

	await eventData.registerForEvent(e1._id.toString(), u2.username);
	await eventData.registerForEvent(e1._id.toString(), u3.username);

	await eventData.registerForEvent(e2._id.toString(), u4.username);

	await commentData.createComment(e1._id.toString(), u1.username, 'Lets Party');
	await commentData.createComment(
		e1._id.toString(),
		u2.username,
		'I will drink all the tea'
	);

	let updateParamter = {};
	updateParamter.favoriteEvents = u4.favoriteEvents;
	updateParamter.favoriteEvents.push(e3._id.toString());
	await userData.updateUser(u4.username, updateParamter);
	console.log('done');
	await connection.closeConnection();
	return;
}

main().catch(console.log);
