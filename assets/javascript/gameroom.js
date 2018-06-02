  function renderGameRoom() {
    // when ever the user DB value is being update, the following function will be trigger
    gamesRef.on("value", function(childsnapshot) {
      console.log("Game List :" + userKey);
      $(".gameroom").empty();
      childsnapshot.forEach(function(child) {
       // if (child.key !== userKey){
          var gameID = child.key
          var photo = child.val().photo;
          var name = child.val().name;
          var status = child.val().status; 
          var timestamp = child.val().timestamp;
          console.log("Game Name:" + child.val().name);
          console.log("Game Status:" + child.val().status);
          if (status ==="pending") {
            $(".gameroom").append("<div class='chat'><div class='chat-header clearfix'><img class='rounded-circle' src="+ photo +" alt='avatar' /><div class='chat-about'><div class='chat-with'> Game created by " + name + "</div><span class='message-data-time'>" + timestamp + "</span></div><button class='join-game' data-value='"+ gameID + "'>Join Game</button><i class='fa fa-star'></i></div></div>");
          //  $(".gameroom").append("<BR>");
          }
       // }
      });
    });
  }


function joinGame() {
  $(".gameroom").on("click",".join-game",function(){
    var gameID = $(".join-game").attr("data-value");
    var d = new Date();
    var timestamp = d.toUTCString();
    console.log("Joined Game : "+ gameID);
    if(gameID !== ""){
      gamesRef.child(gameID).update({status:'matched',timestamp:timestamp});
      gamesRef.child(gameID).child("players").child("player1").update({status:'matched_players2'});
      gamesRef.child(gameID).child("players").child("player2").update({uID:userKey,win:0,lose:0,name:name,status:'matched_player2'});
      $(".join-game").hide();
    }
    //window.open("gamePage.html", '_blank');  //open a new  window
    document.location.href = "gamePage.html";   //open the same window
  });
}

$(document).ready(function(){
  renderGameRoom();
  joinGame();
});