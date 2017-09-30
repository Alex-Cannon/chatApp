var express = require('express');
var router = express.Router();
var striptags = require('striptags');
var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/chatApp', ['chatrooms']);
var ObjectID = require('mongodb').ObjectID;

var returnRouter = function(io){
  var roomID = 0;
  var user = "";

  //Updates the given room with new data
  var updateRoom = function(id, update){
    db.chatrooms.update({"_id": new ObjectID(id)}, {$set:update});
  }

  router.get('/:id', (req, res)=>{
    roomID = '' + req.params.id;
    user = req.query.userName;
    //If this room exists...
    db.chatrooms.findOne({"_id": new ObjectID(req.params.id)}, function(err, data){
      if(err){
        console.log(err);
      }else{
        console.log(data);
        data.userName = req.query.userName;
        if(!data.userName){
          console.log("WARNING: USER IS NOT DEFINED");
        }
        res.render('chat', data);

        //Socket Stuff
        io.once('connection', function(socket){
          //Join the given room
          socket.once("join", function(){
            console.log(user + ' connected to room ' + roomID);
            //"Remember" the new room, if we don't have it yet
            if(!data.pastMessages){
              data.pastMessages = [];
            }
            if(!data.users){
              data.users = [];
            }

            //join the room
            socket.join(roomID);

            //Update user on recent posts
            for(let i = 0; i < data.pastMessages.length; i++){
              socket.emit('chat message', data.pastMessages[i]);
            }

            //update user on who is in the chat room
            console.log("current users: " + data.users);
            data.users.push(user);
            console.log("after new user: " + data.users);
            io.to(roomID).emit("user", {current:data.users});

            //Tell everyone who just joined the room
            io.to(roomID).emit('chat message', {from:"chatBot", msg:user + " joined the chat room."});
            data.pastMessages.push({from:"chatBot", msg:user + " joined the chat room."});

            //Save these changes to the past messages & save the new user
            updateRoom(req.params.id, {pastMessages: data.pastMessages, users: data.users});

          });

          //Save each message from the chat
          socket.on('chat message', function(msgData){
            console.log(user + " : " + msgData.msg);
            //Save message. Keep only the last 20 messages.
            data.pastMessages.push(msgData);
            data.pastMessages = data.pastMessages.length >= 20?data.pastMessages.slice(data.pastMessages.length - 20, data.pastMessages.length):data.pastMessages;
            updateRoom(req.params.id, {pastMessages: data.pastMessages});
            io.in(roomID).emit('chat message', msgData);
          });

          //Tell us when someone disconnects
          socket.on('disconnect', function(socket){
            console.log(user + " disconnected from " + roomID);
            setTimeout(function deleteRoom(){
              if(!io.nsps['/'].adapter.rooms[roomID]){
                console.log("No more clients in room " + data.roomName);
                db.chatrooms.remove({"_id": new ObjectID(req.params.id)},{justOne:1},function(err, data){
                  if(err){
                    console.log("error");
                  }else{
                    console.log("room " + data.roomName + ' was deleted');
                  }
                });
              }
            }, 5000);
            let index = data.users.indexOf(user);
            if(index > -1){
              console.log("removed " + user + " from " + data.roomName);
              console.log("NOTE: Old instances of users are NOT deleted when a user refreshes the page!");
              data.users = data.users.splice(index, 1);
            }
            io.in(roomID).emit('user', {current:data.users});
            updateRoom(req.params.id, {users: data.users});
          });

        });
      }
    });
  });




  return router;
}


module.exports = returnRouter;
