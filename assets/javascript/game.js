/*Functions for webcam and emotion detect*/
/*
    TODO STEVEN:
    1) Plan out flow of data
    2) GamePage.html and GamePage Chat
*/
//TODO FIREBASE LISTENER HERE

//Active and attach camera to DOM element
//Webcam.attach('#my_camera');

function timeDelay(){
    //TEMP Function to delay taking a picture
    setTimeout(take_snapshot, 5000);
}

function take_snapshot(){
    /*Function to snap a picture and passing in a callback function
    image data will be passed as data_uri*/
    Webcam.snap(function(data_uri){
        detectFace(data_uri);
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
            var emotion;
            //compare most likely emotion
            switch (emotionValue){
                case emotions.happiness:
                    emotion = "Happy";
                    console.log("you are happy");
                    break;
                case emotions.surprise:
                    emotion = "Surprise";
                    console.log("you are suprised");
                    break;
                case emotions.neutral:
                    emotion = "Neutral";
                    console.log("you are neutral");
            }

            //TODO SEND TO FIREBASE update player data

            //DEBUG LOG
            //console.log("face detected");
            console.log("Happiness: " + emotions.happiness);
            console.log("Surprise: " + emotions.surprise);
            console.log("Neutral: " + emotions.neutral)
        }
    });
}

/*TODO RPS LOGIC HERE AND UPDATE FIREBASE*/

//RPS logic: Happy > Neutral, Neutral > Suprise, Suprise > Happy
//NOTE: Global variable works
/*gamesRef.set({
    gameID: "Game1",
});*/