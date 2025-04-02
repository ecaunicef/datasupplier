var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const { xss } = require('express-xss-sanitizer');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var counsellingRoute = require('./routes/counsellingRoute.js');
var categoryRoute = require('./routes/categoryRoute.js');
var countryRoute = require('./routes/countryRoute.js');
let blogRouter = require('./routes/blogRoute');
let feedbackRouter = require('./routes/feedbackRoute');
var bodyParser = require('body-parser');
const sequelize = require('./model/db.js');
var helplineRouter = require('./routes/helplineRoute.js');
var moodTrackerRouter = require('./routes/moodTrackerRoute.js');
var classificationRoute = require('./routes/classificationRoute.js')
var app = express();
//Locale handling
const credentialRoute=require('./routes/credentialRoute.js');
const homePageCountRoute=require('./routes/homepageRoute.js');
const areaRoute=require('./routes/areaRoute.js');
const chatlineRoute = require('./routes/mentalHealthChatline.js');
const languageRoute = require('./routes/languageRoute.js');
const moodMapperRoute = require('./routes/moodMapperRoute.js');
const uploadedFileInfoRoute = require('./routes/uploadedFileInfoRoute.js');

//connect to db
require('./model/db');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


const customXSSOptions = {
  allowedKeys: ['filter','pcFormGroups']
};

app.use(xss(customXSSOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




//routing

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/credential', credentialRoute);
app.use('/counselling', counsellingRoute);
app.use('/category', categoryRoute);
app.use('/country', countryRoute);
app.use('/blog',blogRouter);
app.use('/feedback', feedbackRouter);
app.use('/helpline', helplineRouter);
app.use('/moodtracker', moodTrackerRouter)
app.use('/summary', homePageCountRoute)
app.use('/area', areaRoute)
app.use('/classification', classificationRoute)
app.use('/chatline', chatlineRoute);
app.use('/language', languageRoute);
app.use('/mood-mapper', moodMapperRoute);
app.use('/upload-info', uploadedFileInfoRoute);




const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}.`)
// })

app.listen(port, async () => {
  console.log(`Server is running on ${port}`);
  try {
    await sequelize.authenticate(); // Test the database connection
    console.log('Database connection has been established successfully.');
    await sequelize.sync(); // Sync the database models
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});




// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;