$(document).ready(function(){

  //Gets the base url
  var getBaseURL = function()
  {
    return window.location.protocol + "//" + window.location.hostname + ':' + window.location.port;
  }

  //Returns an array of chat Rooms that match the query
  var search = function queryRooms(keywords){
    $.ajax({
      url: getBaseURL() + '/api/rooms',
      type: 'GET',
      dataType: 'json',
      data:{keywords: keywords},
      success: function displayRooms(data){
        console.log('search success');
        console.log(data);
        $("#rooms").empty();
        let userName = $("#userName").val().replace(/\s/, "") != ""?$("#userName").val():"Anon";
        for(let i = 0; i < data.length; i++)
        {
          $("#rooms").append(
            '<div class="row">'+
            '<a class="col chatRoom rounded" href="/chat/'+data[i]._id+'?userName='+
            userName+'">'+data[i].roomName+'</a>'+
            '</div>'
          );
        }

      },
      error: function displayError(){
        $("#rooms").empty();
        $("#rooms").append(
          '<div class="row">'+
            '<div class="col">'+
              '<h1>Sorry, we could not find that chat room.</h1>'+
            '</div>'+
          '</div>'
        )
      }
    })
  }

  $("#roomSearch").on("keyup", function(e) {
    if(e.keyCode == 13 && $("#searchbar").val() != "")
    {
      search($("#roomSearch").val());
    }
  });

  search('');

});
