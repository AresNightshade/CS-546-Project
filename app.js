// Setup server, session and middleware here.
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const configRoutes = require('./routes');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');

app.use(cookieParser());

const viewsPath = path.join(__dirname, './views');

// Setup handlebars engine and veiws location
app.set('views', viewsPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(
	session({
		name: 'AuthCookie',
		saveUninitialized: false,
		secret: "This is a secret.. shhh don't tell anyone",
		resave: false,
		cookie: { maxAge: 600000 },
	})
);

// app.use(async (req, res, next) => {
// 	if (req.session.user) {
// 		console.log(
// 			`${new Date().toUTCString()} ${req.method} ${
// 				req.originalUrl
// 			} (Authenticated User)`
// 		);
// 	} else {
// 		console.log(
// 			`${new Date().toUTCString()} ${req.method} ${
// 				req.originalUrl
// 			} (Non-Authenticated User)`
// 		);
// 	}

// 	next();
// });

// app.use('/protected', (req, res, next) => {
// 	if (!req.session.user) {
// 		return res.status(403).render('forbiddenAccess');
// 	} else {
// 		next();
// 	}
// });

configRoutes(app);

app.listen(3000, () => {
	console.log("We've now got a server!");
	console.log('Your routes will be running on http://localhost:3000');
});
