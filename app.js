const express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { getAllExercises, getUserData, addExercise } = require('./models/treatment')

var app = express();

app.listen(3000, () => console.log('API listening on port 3000!'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.send({ title: 'API Entry Point' });
});

app.get('/treatment', function (req, res) {
  console.log(req.query);
  const userId = req.query.userId;
  const entity = req.query.entity;

  let getData = null;
  switch (entity) {
    case 'exercise':
      getData = getAllExercises;
      break;
    
    default:
      getData = getUserData;

  }

  // res.sendStatus(500);

  getData(userId).then((data) => {
    
    // filter out the redundant exercises
    // and only return the latest one 
    // for the same round/stage/exercise/treatment
    console.log(data.Items);
    res.send({
      data: data.Items
    });
  });

});


app.post('/treatment', function (req, res) {

  // key diff: you can directly add new record 
  // instead read first and then merge and write

  const body = req.body;

  let createEntity = null;
  switch (body.entity) {
    case 'exercise':
      createEntity = addExercise;
      break;
    default:
      break;
  }

  createEntity(body.item).then((data) => {
    res.sendStatus(200);
  }).catch((error) => {
    // res.sendStatus(409).send({
    //  data: error.Items
    // });
  })

});

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
