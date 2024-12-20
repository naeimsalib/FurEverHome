require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const Pet = require('./models/pet'); // Import the Pet model

const app = express();

// Set the port from environment variable or default to 3000
const port = process.env.PORT || '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Mount Middleware
// Morgan for logging HTTP requests
app.use(morgan('dev'));
// Static middleware for returning static assets to the browser
app.use(express.static('public'));
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'));
// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Ensure the session is not saved if uninitialized
  })
);

// Add the user (if logged in) to req.user & res.locals
app.use(require('./middleware/add-user-to-locals-and-req'));

// Middleware to set currentUrl
app.use((req, res, next) => {
  res.locals.currentUrl = req.url;
  next();
});

// Routes

// GET /  (home page functionality)
app.get('/', async (req, res) => {
  const pets = await Pet.find().populate('owner');
  res.render('home.ejs', { title: 'Home Page', pets, user: req.user });
});

// '/auth' is the "starts with" path that the request must match
// The "starts with" path is pre-pended to the paths
// defined in the router module
app.use('/auth', require('./controllers/auth'));

app.use('/pets', require('./controllers/pets'));

app.use('/favorites', require('./controllers/favorites'));

// Any requests that get this far must have a signed in
// user thanks to ensureSignedIn middleware
app.use(require('./middleware/ensure-signed-in'));
// Any controller/routes mounted below here will have
// ALL routes protected by the ensureSignedIn middleware

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
