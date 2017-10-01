$(document).ready(function(){
  var socket = io.connect();
  socket.emit('join', 'room data');

  //Sends a message to the server on click
  $("#sendMsgBtn").click(function sendMessage(){
    if($("#chatTextbox").val() !== ""){
      console.log($("#userID").text());
      //send message
      socket.emit('chat message',
      {userName:$("#userName").text(), userID:$("#userID").text(), msg:$("#chatTextbox").val()});
      //empty chat box
      $("#chatTextbox").val("");
    }
  });

  //Updates the chat
  var updateChat = function(msgData){
    console.log("got msg data: " + JSON.stringify(msgData));
    if(msgData){
      if(msgData.userID === $("#userID").text()){
        $(".chatBox").append(
          '<div class="ourMsg rounded">'+
            '<i>'+msgData.userName+':</i><br>'+
            msgData.msg+
          '</div>');
      }else{
        $(".chatBox").append(
          '<div class="otherMsg rounded">'+
            '<i>'+msgData.userName+':</i><br>'+
            msgData.msg+
          '</div>');
      }
    }
  }

  //updates the chat when someone sends a message
  socket.on('chat message', updateChat);

});
