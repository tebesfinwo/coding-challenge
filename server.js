'use strict';

//For express
var express = require('express'),
    app = express(),
    swig = require('swig'), 
    compression = require('compression'), 
    helmet = require('helmet'), 
    flash = require('connect-flash'), 
    session = require('express-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    path = require('path');

//Controllers 
var userController = require('./app/controllers/user.controller');

//compression 
app.use(compression({
  filter : function(req, res){
    return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
  }, 
  level : 3
}));

app.set('showStackError', true);

//set swig as template engine
app.engine('html', swig.renderFile);

//set views engine and view paths
app.set('view engine', 'html');
app.set('views', __dirname + '/app/views');

//set template caching to false
app.set('view cache', true);
swig.setDefaults({ cache: false });


//setting the app router and static folder 
app.use(express.static(path.resolve('./public')));

//body parser
app.use(bodyParser.urlencoded({
  extended : true
}));

app.use(bodyParser.json());

app.use(methodOverride());

//app session 
app.use(session({
  secret : 'abcdef', 
  resave : true, 
  saveUnintialized : true
}));


// helmet to secure Express header
app.use(helmet.xframe());
app.use(helmet.xssFilter());
app.use(helmet.nosniff());
app.use(helmet.ienoopen());
app.disable('x-powered-by');

//routes
app.get('/', userController.getUsersOver21);
app.get('/users', userController.getRandomUsers);
app.post('/users', userController.filterUsers);
app.post('/users/new', userController.saveUser);


app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


function logErrors(err, req, res, next){
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next){
  if(req.xhr){
    res.status(500).send({error : 'Something blew up!'});
  }else {
    next(err);
  }
}

function errorHandler(err, req, res, next){
  res.status(500);
  res.render('error', { error : err } );
}

var server = app.listen(process.env.PORT || 3000, function(){

  var host = server.address().address; 
  var port = server.address().port;

  console.log('This app is listening at http://%s:%s', host, port);

});
