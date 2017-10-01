$(document).ready(function(){

  //Redirects the user to Base url + provided path
	var redirect = function(path)
	{
		window.location.href = window.location.protocol + "//" + window.location.hostname + ':' + window.location.port + path;
	}

  //Gets the base url
  var getBaseURL = function()
  {
    return window.location.protocol + "//" + window.location.hostname + ':' + window.location.port;
  }

  //Returns a random integer between the min and mix values
  function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        for(let i = 0; i < data.length; i++)
        {
          $("#rooms").append(
            '<div class="row">'+
              '<button class="col chatRoom rounded" id="'+data[i]._id+'">'+
                data[i].roomName+
              '</button>'+
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

  //'chat/'+data[i]._id+'?userName='+userName+'&userID='+getRandom(2,10000000)
  $("#rooms").on('click', function(e){
    if(e.target.id == "rooms"){
      return;
    }
		let userId = getRandom(2,10000000);
    if($("#userName").val() == ""){
      $("#userName").val("Anon"+userId);
    }
    redirect('/chat/'+e.target.id+'?userName='+$("#userName").val()+'&userID='+userId);
  });

  $("#roomSearch").on("keyup", function(e) {
    if(e.keyCode == 13 && $("#searchbar").val() != "")
    {
      search($("#roomSearch").val());
    }
  });

  search('');

});
