var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override');

var indexRouter = require(path.join(__dirname, 'routes', 'index'));
var confRouter = require(path.join(__dirname, 'routes', 'conf'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

var auth = require('./auth')
auth(app)

app.use('/', indexRouter);
app.use('/conf', confRouter);
app.use('/track', require(path.join(__dirname, 'routes', 'tracks')));
//app.use('/date', require(path.join(__dirname, 'routes', 'dates')));
app.use('/follow', require(path.join(__dirname, 'routes', 'follows')));
app.use('/user', require(path.join(__dirname, 'routes', 'users')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
