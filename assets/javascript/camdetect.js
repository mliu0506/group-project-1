/*Functions for webcam and emotion detect*/
/*
    TODO STEVEN:
    1) Plan out flow of data
    2) Either return values or depend on global variables
    3) Clean up functions
*/

function activateCamera(id){
    //Function to activate computer's camera and hook it to DOM element id
    //Note: will cause browser to request premission each time
    Webcam.attach(id);
}

function take_snapshot(){
    /*Function to snap a picture and passing in a callback function
    image data will be passed as data_uri*/
    Webcam.snap(function(data_uri){
        //TODO send and update to Firebase
    });
    //Turns off Camera
    //Webcam.reset();
}

function detectFace(){
    /*Function to perform ajax call to Face++ API to detect faces from image
    and returns detected emotions*/

    var queryURL = "https://api-us.faceplusplus.com/facepp/v3/detect";
    var data64 = "" //TODO place either firebase snapshot here or pass in local variable
    //REMEMBER: string.replace("data:image/jpeg;base64,","");
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
        //TODO face logic here
        console.log(response.faces[0].attributes.emotion.happiness);
        var json = JSON.stringify(response, null, ' ');
        console.log(json);
    });
}