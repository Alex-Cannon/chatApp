//Require our modules
var express = require('express');
var path = require('path');
var helmet = require('helmet');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Add some basic security to our app
app.use(helmet());

//Sets the view engine (ex: Jade, Ejs, etc.)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Use Body parser for ALL routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Define our routes
var index = require('./routes/index');
var create = require('./routes/create');
var join = require('./routes/join');
var chat = require('./routes/chat')(io);
var api = require('./routes/api');

//Use our public folder to serve files to the client
app.use(express.static(path.join(__dirname, 'public')));

//Use our routes
app.use('/', index);
app.use('/create', create);
app.use('/join', join);
app.use('/chat', chat);
app.use('/api', api);

//Listen on a certain port
http.listen(3000, function(req, res){
  console.log("app listening on port 3000");
})
