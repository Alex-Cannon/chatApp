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

  //Converts a form's data into JSON
  var formToJSON = function convert(formEvent){
    let dataArr = $(formEvent.target).serializeArray();
    let dataObj = {};
    dataArr.map(function(input){
      dataObj[input.name] = input.value;
    });
    return dataObj;
  }

  $("#createForm").submit(function makeChatRoomAndRedirect(e){
    e.preventDefault();
    var roomData = formToJSON(e);
		roomData.users = [];
    $.ajax({
      url:getBaseURL() + '/api/create',
      type: "POST",
      dataType: 'json',
      data: roomData,
      success:function redirectUser(data){
        redirect('/chat/'+ data.id +"?userName=" + roomData.ownerName+"&userID=1");
      },
      error: function retry(xml, status, err){
        console.log("error");
      }
    })
  })
});
