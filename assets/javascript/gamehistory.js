function renderHistory() {
    
historyRef.child("TestPicture").once("value",function(childSnapshot) {  
    var gamephoto = childSnapshot.val().img;
    $('.slider').prepend("<div class='slide'><img src='"+ gamephoto + "' /><p> testing picture </p></div>");       
    });
    
    // when ever the user DB value is being update, the following function will be trigger
    //historyRef.on("child_added",function(childSnapshot){
    //    var gamephoto = childSnapshot.val().gamephoto;
    //    var username = childSnapshot.val().name;
    //    var userID = childSnapshot.val().uID;
    //    var result = childSnapshot.val().result;
    //    var choice = childSnapshot.val().choice;
    //    var timestamp = childSnapshot.val().timestamp;
    //    $('.slider').append("<div class='slide'><img src='"+ gamephoto + "' /><p>" + username +" : " + result + " : " + choice + "</p></div>");       
    //});
  }


function renderProfile() {
    usersRef.child(userKey).once("value",function(childSnapshot) {
        var name = childSnapshot.val().name;
        var totgames = childSnapshot.val().totgames;
        var totwin = childSnapshot.val().totwin;
        var totlose = childSnapshot.val().totlose;
        $(".userName").text(name);
        $(".gameResult").html("Number of Game : " + totgames + "<br>Win : " + totwin + "<br>Lose : "+ totlose +"</p>" );

    });
}



$(document).ready(function(){
  renderHistory();
  renderProfile();
});