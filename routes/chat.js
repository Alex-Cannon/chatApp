var express = require('express');
var router = express.Router();
var striptags = require('striptags');
var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/chatApp', ['chatrooms']);
var ObjectID = require('mongodb').ObjectID;

var returnRouter = function(io){
  var roomID = 0;

  //Updates the given room with new data
  var updateRoom = function(id, update){
    db.chatrooms.update({"_id": new ObjectID(id)}, {$set:update}, function(err, data){
      if(err){
        console.log("ERROR updating room");
        console.log(err);
      }else{
        console.log("Done updating room.");
      }

    });
  }

  router.get('/:id', (req, res)=>{
    roomID = '' + req.params.id;
    let user = {userName:req.query.userName, userID:req.query.userID};
    //Check if this room exists. If it does, join it.
    db.chatrooms.findOne({"_id": new ObjectID(req.params.id)}, function(err, data){
      if(err){
        console.log(err);
      }else{
        console.log("GOT ROOM DATA:");
        console.log(data.pastMessages);
        let ejsData = data;
        ejsData.user = user;
        //Render the chat page
        res.render('chat', ejsData);

        //Socket Managment
        io.once('connection', function(socket){
          //Join the given room
          socket.once("join", function(){
            if(!data.pastMessages){
              data.pastMessages = [];
            }
            if(!data.users){
              data.users = [];
            }
            console.log(user.userName + ' ('+user.userID+') connected to room ' + data.roomName);

            //join the room
            socket.join(roomID);

            //Update user on recent posts
            for(let i = 0; i < data.pastMessages.length; i++){
              socket.emit('chat message', data.pastMessages[i]);
            }

            //update users on who is in the chat room
            let idArr = data.users.map(function(user){
              return user.userID;
            });
            if(idArr.indexOf(user.userID) == -1){
              console.log("user " + user.userName + " is new to the chat room:");
              console.log(JSON.stringify(user));
              data.users.push(user);
            }

            //Tell everyone who just joined the room
            io.to(roomID).emit('chat message', {userName:"chatBot",userID:-1, msg:user.userName + " joined the chat room."});
            data.pastMessages.push({userName:"chatBot", userID:-1, msg:user.userName + " joined the chat room."});

            //Save these changes to the past messages & save the new user
            updateRoom(req.params.id, {pastMessages: data.pastMessages, users: data.users});
            });

          //Save each message from the chat
          socket.on('chat message', function(msgData){
            console.log(msgData.userName + " : " + msgData.msg);
            //Save message. Keep only the last 20 messages.
            data.pastMessages.push(msgData);
            data.pastMessages = data.pastMessages.length >= 20?data.pastMessages.slice(data.pastMessages.length - 20, data.pastMessages.length):data.pastMessages;
            updateRoom(req.params.id, {pastMessages: data.pastMessages});
            io.in(roomID).emit('chat message', msgData);
          });

          //Tell us when someone disconnects
          socket.on('disconnect', function(socket){
            console.log(user.userName + " disconnected from " + roomID);
            //Delete this room when no one is in it
            setTimeout(function deleteRoom(){
              if(!io.nsps['/'].adapter.rooms[roomID]){
                console.log("No more clients in room " + data.roomName);
                db.chatrooms.remove({"_id": new ObjectID(req.params.id)},{justOne:1},function(err, data){
                  if(err){
                    console.log("error");
                  }else{
                    console.log("room was deleted.");
                  }
                });
              }
            }, 5000);

            //Announce
            io.to(roomID).emit('chat message', {userName:"chatBot",userID:-1, msg:user.userName + " left the chat room."});
            data.pastMessages.push({userName:"chatBot", userID:-1, msg:user.userName + " left the chat room."});
            data.users = data.users.map(function removeUser(val){
              if(val.userID !== user.userID && val){
                console.log("UNCHANGED: " + JSON.stringify(val));
                return val;
              }else{
                console.log("REMOVED: " + JSON.stringify(val));
              }
            });
            updateRoom(req.params.id, {pastmessages: data.pastMessages, users: data.users});
          });
        });
      }
    });
  });




  return router;
}


module.exports = returnRouter;
