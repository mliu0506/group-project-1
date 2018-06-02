/*
    game.js contains the JavaScript to run the main game of Rock Paper Scissor (Happy, Suprise, Neutral)
    Webcam library and Face++ API are called here
*/
//Shorthand for $(document).ready(function(){...});
$(function(){

    //GamePage Global Variables
    var messageList = $("#messageList"); //Variable for local chat messages
    var isPlayer2 = false;
    var camOn = false;
    var playerRef;
    var opponentRef;
    //Variables for local game score
    var winScore;
    var loseScore;
    //Variables for total scores
    var totalWin;
    var totalLose;
    var totalGames;

    var intervalID;
    var timer;

    tempRef.on('value', function(snapshot){
        var gameID = snapshot.val().gameID;
    });
    //Firebase Listeners
    //Listen value to grab total score count
    usersRef.child(userKey).on('value', function(snapScore){
        totalWin = snapScore.val().totwin;
        totalLose = snapScore.val().totlose;
        totalGames = snapScore.val().totgames;
    });

    //Listen event for game status
    gamesRef.child(gameID).on('value', function(snapshot){
        if (snapshot.val().status == "matched"){
            //Active and attach camera to DOM element
            Webcam.attach('#my_camera');
            camOn = true;

            //Check if user is game room creator, assign reference to user path
            if (snapshot.val().players.player1.uID == gameID){
                playerRef = gamesRef.child(gameID).child("players").child("player1");
                opponentRef = gamesRef.child(gameID).child("players").child("player2");
                $("#opponentName").text(snapshot.val().players.player2.name);
                winScore = snapshot.val().players.player1.win;
                loseScore = snapshot.val().players.player1.lose;
            }
            else{
                isPlayer2 = true;
                playerRef = gamesRef.child(gameID).child("players").child("player2");
                opponentRef = gamesRef.child(gameID).child("players").child("player1");
                $("#opponentName").text(snapshot.val().players.player1.name);
                winScore = snapshot.val().players.player2.win;
                loseScore = snapshot.val().players.player2.lose;
            }
            /*gamesRef.child(gameID).update({
                status:'game_running'
            });*/
            console.log("starting Game")
            startRPS();
        }
        else if(!(snapshot.child('players').child('player2').exists())){
            //No player 2 or player 2 left
            if(camOn){
                //Turns off Camera
                Webcam.reset();
            }
            $("#opponentName").text("Waiting for player 2");
            gamesRef.child(gameID).update({
                status:'pending'
            });
        }
        else if(snapshot == null){
            //Game got removed
            // TODO //
            //window.location.assign("index.html");
        }
    });

    //Listen event for players status
    gamesRef.child(gameID).child('players').on('value', function(playerSnap){
        if (playerSnap.val().player1.status == 'picture_taken' && playerSnap.val().player2.status == 'picture_taken'){
            playerRef.update({status: 'game_complete'});
            if (isPlayer2){
                var result = compareFace(playerSnap.val().player2.emotion, playerSnap.val().player1.emotion);
                displayOpponentImage(playerSnap.val().player1.img, playerSnap.val().player1.emotion, playerSnap.val().player1.likely);
            }
            else{
                var result = compareFace(playerSnap.val().player1.emotion, playerSnap.val().player2.emotion);
                displayOpponentImage(playerSnap.val().player2.img, playerSnap.val().player2.emotion, playerSnap.val().player2.likely);
            }
            //update scores
            switch (result){
                case 'win':
                    playerRef.update({win: winScore++});
                    usersRef.child(userKey).update({totwin: totalWin++})
                    break;
                case 'lose':
                    playerRef.update({lose: loseScore++});
                    usersRef.child(userKey).update({totlose: totalLose++})
            }
            usersRef.child(userKey).update({totgames: totalGames++})
            //TODO display score and update game status//
        }
        displayPlayerScores();
        $("#playerName").text(playerSnap.val().player1.name);
        /*if (isplayer2){
            //Display player1 score in opponent zone
            $("#opponentWin").text(snapScore.val().player1.win);
            $("#opponentLose").text(snapScore.val().player1.lose);
        }
        else{
            //Display player2 score in opponent zone
            $("#opponentWin").text(snapScore.val().player2.win);
            $("#opponentLose").text(snapScore.val().player2.lose);
        }*/
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

    function displayPlayerScores(){
        //Function to display player score
        $("#playerWin").text(winScore);
        $("#playerLose").text(loseScore);
    }
    //FUNCTIONS
    function startRPS(){
        //Start game
        $("#playerImage").empty();
        timer = 5;
        intervalID = setInterval(countdown, 1000);
        timeDelay();
    }
    function countdown(){
        timer--;
        $("#playerImage").text(timer);
    }

    function timeDelay(){
        //TEMP Function to delay taking a picture
        setTimeout(take_snapshot, 5000);
    }

    function take_snapshot(){
        /*Function to snap a picture and passing in a callback function
        image data will be passed as data_uri*/
        clearInterval(intervalID);
        Webcam.snap(function(data_uri){
            detectFace(data_uri);
            console.log("picture taken");
        });
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
                $("#playerImage").text("Take Picture Again");
                setTimeout(startRPS, 2000);

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
                var playerData = {
                    emotion: emotion,
                    likely: likely,
                    img: data_uri,
                    status: 'picture_taken'
                }
                //playerRef.update(playerData);
                displayPlayerImage(data_uri, emotion, likely);

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

    function displayPlayerImage(data_uri, emotion, likely){
        //Function to display player image in the image section
        $("#playerImage").empty();
        $("#my_camera").css({display: 'none'});
        var img = $("<img>");
        img.attr({
            src: data_uri,
            class: 'img-fluid gameImages'
        });
        var emo = $("<p>");
        emo.text("You are " + emotion + " (" + likely +")");
        $("#playerImage").append(img);
        $("#playerImage").append(emo);
    }

    function displayOpponentImage(data_uri, emotion, likely){
        $("#opponentImage").empty();
        var img = $("<img>");
        img.attr({
            src: data_uri,
            class: 'img-fluid gameImages'
        });
        var emo = $("<p>");
        emo.text("You are " + emotion + " (" + likely +")");
        $("#opponentImage").append(img);
        $("#opponentImage").append(emo);
    }

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
            playerName: name,
            message: message
        });
    }

    //Click event for local message field submit
    $("#submitMessage").on("click", function(event){
        event.preventDefault();
        var message = $("#message").val();
        sendChatMessage(message);
        //Clear chat fields
        $("#message").val("");
    });

    //TODO//
    //Click event for leaving game
    $("#leaveGame").on("click", function(){
        if(isplayer2){
            playerRef.remove();
        }
        else{
            //Remove entire game from play
        }
    });

    $("#camTest").on("click", function(){
        $("#playerImage").empty();
        $("#my_camera").css({display: "block"});
        console.log("cam active");
        startRPS();
    });
});