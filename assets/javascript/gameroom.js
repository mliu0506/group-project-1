  function renderGameRoom() {
    // when ever the user DB value is being update, the following function will be trigger
    gamesRef.on("value", function(childsnapshot) {
      console.log("Game List :" + userKey);
      $(".gameroom").empty();
      childsnapshot.forEach(function(child) {
       // if (child.key !== userKey){
          
          var photo = child.val().photo;
          var name = child.val().name;
          var status = child.val().status; 
          var timestamp = child.val().timestamp;
          console.log("Game Name:" + child.val().name);
          console.log("Game Status:" + child.val().status);
          if (status ==="pending") {
            $(".gameroom").append("<div class='chat'><div class='chat-header clearfix'><img class='rounded-circle' src="+ photo +" alt='avatar' /><div class='chat-about'><div class='chat-with'> Game created by " + name + "</div><span class='message-data-time'>" + timestamp + "</span> &nbsp; &nbsp;<button class='joingame'>Join Game</button></div></div><i class='fa fa-star'></i></div>");
          }
       // }
      });
    });
  }

$(document).ready(function(){
  renderGameRoom();
  logout();
});