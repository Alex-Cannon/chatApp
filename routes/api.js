var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/chatApp', ['chatrooms']);
var ObjectID = require('mongodb').ObjectID;


//Creates a chat room
router.post('/create', function createChatRoom(req, res){
  console.log(req.body);
  db.chatrooms.save(req.body, function results(err, data){
		if(err){
			res.sendStatus(400);
		}else{
      console.log(data);
      res.json({id:data._id});
    }
	});
});

//Deletes a chat room
router.get('/rooms', function getRooms(req, res){
  console.log(req.query.keywords);
  db.chatrooms.find({roomName: {$regex: new RegExp(req.query.keywords, "i")}}, {_id:1, roomName:1},
    function results(err, data){
    if(err){
      console.log(err);
    }else{
      console.log(data.length);
      data = data.length > 10?data.slice(0, 10):data;
      res.json(data);
    }
  });
});

module.exports = router;
