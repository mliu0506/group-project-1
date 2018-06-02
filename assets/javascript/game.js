/*
    game.js contains the JavaScript to run the main game of Rock Paper Scissor (Happy, Suprise, Neutral)
    Webcam library and Face++ API are called here
*/

//GamePage Global Variables
var messageList = $("#messageList"); //Variable for local chat messages

/* Disabled firebase listener for testing
//TODO FIREBASE LISTENER HERE
//TODO fix path listener
gamesRef.child(gameID).on('value', function(snapshot){
    //Detect if P1 and P2 exists
    //NOTE: Change gameRoom so when P2 Joins change state of game to JOINED, Then check here
    if (snapshot.val().state === "JOINED"){
        console.log("hi hi");
        //Start game routine
    }
    //Change so to detect player 2 slot open
    else if(!(snapshot.child(gameID).child('players').child('p2').exists())){
        console.log(snapshot.val());
        console.log("nothing here");
        gamesRef.child(gameID).update({
            state: "OPEN"
        });
    }
});

//Listen event for local chat messages
gamesRef.child(gameID).child('chat').on('child_added', function(chatsnapshot){
    if (messageList.text() == ""){
        //Account for the first blank entry
        messageList.text(`${chatsnapshot.val().playerName}: ${chatsnapshot.val().message}`);
    }
    else{
        var previousText = messageList.text();
        messageList.text(`${previousText}\n${chatsnapshot.val().playerName}: ${chatsnapshot.val().message}`);
    }
    //auto scroll to bottom of textarea, show latest chat
    messageList.scrollTop(messageList[0].scrollHeight);
});
*/
//Active and attach camera to DOM element
Webcam.attach('#my_camera');

function timeDelay(){
    //TEMP Function to delay taking a picture
    setTimeout(take_snapshot, 5000);
}

function take_snapshot(){
    /*Function to snap a picture and passing in a callback function
    image data will be passed as data_uri*/
    Webcam.snap(function(data_uri){
        detectFace(data_uri);
        console.log("picture taken");
    });
    //Turns off Camera
    //Webcam.reset();
}

function detectFace(data_uri){
    /*Function to perform ajax call to Face++ API to detect faces from image
    and returns detected emotions*/

    var queryURL = "https://api-us.faceplusplus.com/facepp/v3/detect";
    //Removes 'data:image/jpeg;base64,' from the uri data to match Face++ parameter image_base64
    var data64 = data_uri.replace("data:image/jpeg;base64,","");
    //Create AJAX call
    $.ajax({
        url: queryURL,
        method: "POST",
        data: {
            api_key: "-8C4WG8ut30x5f95uvD5KPtfIth1wgnS",
            api_secret: "6uz6xBUtQLmoCidpBpHiaoT_6FMIFvvc",
            return_attributes: "emotion",
            image_base64: data64
        }
    }).then(function(response){
        //DEBUG LOG
        /*console.log(response.faces);
        var json = JSON.stringify(response, null, ' ');
        console.log(json);*/

        if(response.faces[0] == null){
            //Face++ could not detect a face in the given image, retake picture.
            //TODO: Either change take_snapshot or create a timer function
            timeDelay(); //TEMP function

            //DEBUG LOG
            console.log("Take Picture Again");
        }
        else{
            //Face++ detected a face, start analying emotions
            var emotions = response.faces[0].attributes.emotion;
            var emotionValue = Math.max(emotions.happiness,emotions.surprise,emotions.neutral);
            var likely = likelyEmotion(emotionValue);
            var emotion;
            //compare most likely emotion
            switch (emotionValue){
                case emotions.happiness:
                    emotion = "Happy";
                    //console.log("you are happy");
                    break;
                case emotions.surprise:
                    emotion = "Surprise";
                    //console.log("you are suprised");
                    break;
                case emotions.neutral:
                    emotion = "Neutral";
                   // console.log("you are neutral");
            }
            //TODO SEND TO FIREBASE update player data
            var playerData = {
                emotion: emotion,
                likely: likely
            }
            //FirebasePath.update(playerData);
            displayPlayerImage(data_uri);

            //DEBUG LOG
            /*console.log("face detected");
            console.log(likely);
            console.log("Happiness: " + emotions.happiness);
            console.log("Surprise: " + emotions.surprise);
            console.log("Neutral: " + emotions.neutral);*/
        }
    });
}

function likelyEmotion(value){
    //Function takes an int value and returns a string response depending on likely emotion
    if (value >= 70){
        return "Very likely";
    }
    else if (value < 30){
        return "Best match";
    }
    else{
        return "Likely";
    }
}

function displayPlayerImage(data_uri){
    //Function to display player image in the image section
    $("#playerImage").empty();
    $("#my_camera").css({display: 'none'});
    var img = $("<img>");
    img.attr({
        src: data_uri,
        class: 'img-fluid'
    });
    $("#playerImage").append(img);
}

/*TODO RPS LOGIC HERE AND UPDATE FIREBASE*/
function compareFace(playerChoice, opponentChoice){
    //Function to compare player's choice with opponent's choice, return string: win, lose or draw
    //RPS logic: Happy > Neutral, Neutral > Suprise, Suprise > Happy
    switch(playerChoice){
        case 'Happy':
            switch(opponentChoice){
                case 'Neutral':
                    return 'win';
                case 'Suprise':
                    return 'lose';
            }
            break;
        case 'Neutral':
            switch(opponentChoice){
                case 'Suprise':
                    return 'win';
                case 'Happy':
                    return 'lose';
            }
            break;
        case 'Suprise':
            switch(opponentChoice){
                case 'Happy':
                    return 'win';
                case 'Neutral':
                    return 'lose';
            }
            break;
        default:
            return 'draw';
    }
}

function sendChatMessage(message){
    //Function to send local game messages to database
    var ref = gamesRef.child(gameID).child('chat');
    ref.push().set({
        playerName: playerName,
        message: message
    });
}

//Shorthand for $(document).ready(function(){...});
$(function(){
    //Click event for local message field submit
    $("#submitMessage").on("click", function(event){
        event.preventDefault();
        var message = $("#message").val();
        sendChatMessage(message);
        //Clear chat fields
        $("#message").val("");
    });
});

$("#leaveGame").on("click", function(){
    $("#my_camera").css({display: "block"});
    console.log("left the game");
});