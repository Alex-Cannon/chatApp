$(document).ready(function(){
  var socket = io.connect();
  var curUsers = [];
  socket.emit('join', 'room data');

  $("#sendMsgBtn").click(function sendMessage(){
    console.log("button hit");
    if($("#chatTextbox").val() !== ""){
      //send message
      socket.emit('chat message',
      {from:$("#userName").text().replace(/\s/g,''), msg:$("#chatTextbox").val()});
      //empty chat box
      $("#chatTextbox").val("");
    }
  });

  //Updates the chat
  var updateChat = function(msgData){
    console.log("got msg data: " + JSON.stringify(msgData));
    if(msgData){
      if(msgData.from === $("#userName").text().replace(/\s/g,'')){
        $(".chatBox").append(
          '<div class="ourMsg rounded">'+
            '<i>'+msgData.from+':</i><br>'+
            msgData.msg+
          '</div>');
      }else{
        $(".chatBox").append(
          '<div class="otherMsg rounded">'+
            '<i>'+msgData.from+':</i><br>'+
            msgData.msg+
          '</div>');
      }
    }
  }

  //Updates the users when someone disconnects or connects
  var updateUsers = function(data){
    console.log(JSON.stringify(data.current));
    $("#userList").empty();
    for(let i = 0; i < data.current.length; i++){
      $("#userList").append('<li>'+data.current[i]+'</li>');
    }
  }

  //updates a chat upon server changes
  socket.on('chat message', updateChat);

  socket.on('user', updateUsers);
});
