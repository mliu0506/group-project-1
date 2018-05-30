// Initialize Firebase
var config = {
    apiKey: "AIzaSyD1WdNYTW7UDBuGgV0MXM5HCT_exUgvOOo",
    authDomain: "rich-boulevard-203215.firebaseapp.com",
    databaseURL: "https://rich-boulevard-203215.firebaseio.com",
    projectId: "rich-boulevard-203215",
    storageBucket: "rich-boulevard-203215.appspot.com",
    messagingSenderId: "369092792103"
};
firebase.initializeApp(config);
var database = firebase.database();
var chatRef = database.ref('chats');
var usersRef = database.ref('users/');
var gamesRef = database.ref('games/');
var staticsRef = database.ref('statics/');

var name1 = "";
var wins1 = 0;
var losses1 = 0;
var name2 = "";
var wins2 = 0;
var losses2 = 0;
var choice1 = "";
var choice2 = "";
var userKey = "";
var photo ="";
var googleLogin = false;

//Goggle Sign In function
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var name = profile.getName();
  var ID = profile.getId();
  var email = profile.getEmail();
  //store the photo URL
  var photo = profile.getImageUrl();
  googleLogin = true;
  userKey = ID;
  usersRef.child(userKey).update({uID:ID,name,name,photo:photo,email:email,status:"online",lastdisconnect:""});
  console.log("Sign-in User key :" + userKey);
}
//Google Sign out function
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  var d = new Date();
  var lastdisconnect = d.toUTCString();
  auth2.signOut().then(function () {
    usersRef.child(userKey).update({status:"offline",lastdisconnect:lastdisconnect});
    googleLogin = false;
    console.log('User signed out.');
  });
}

//Log out function
$("#signout").on("click", function() {
  if (googleLogin === true) { 
    signOut(); // Google logout
  }
  location.reload(); // when page re-load it will trigger Firebase Disconnect
});

function renderChatRoom() {
  // when ever the user DB value is being update, the following function will be trigger
  uersRef.ref().on("value", function(childsnapshot) {
    console.log("Chat Room User key :" + userKey);
    if (childsnapshot.child(userKey).exists()){
      var photo = usersRef.child(userKey).photo;
      var name = usersRef.child(userKey).name;
      $(".user-photo").html("<img src="+ photo +" alt='avatar' />");
      $(".chat-with").text(name);
    }
    });

  }


//Chat Room Function
(function(){
  
  var chat = {
    messageToSend: '',

    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$button = $('button');
      this.$textarea = $('#message-to-send');
      this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    render: function() {
      this.scrollToBottom();
      if (this.messageToSend.trim() !== '') {
        var template = Handlebars.compile( $("#message-template").html());
        var context = { 
          messageOutput: this.messageToSend,
          time: this.getCurrentTime()
        };

        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val('');
        
        // responses
        var templateResponse = Handlebars.compile( $("#message-response-template").html());
        var contextResponse = { 
          response: this.getRandomItem(this.messageResponses),
          time: this.getCurrentTime()
        };
        
        setTimeout(function() {
          this.$chatHistoryList.append(templateResponse(contextResponse));
          this.scrollToBottom();
        }.bind(this), 1500);
        
      }
      
    },
    
    addMessage: function() {
      this.messageToSend = this.$textarea.val()
      this.render();         
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
    
  };
  
  chat.init();
  
  var searchFilter = {
    options: { valueNames: ['name'] },
    init: function() {
      var userList = new List('people-list', this.options);
      var noItems = $('<li id="no-items-found">No items found</li>');
      
      userList.on('updated', function(list) {
        if (list.matchingItems.length === 0) {
          $(list.list).append(noItems);
        } else {
          noItems.detach();
        }
      });
    }
  };
  
  searchFilter.init();
  
})();

$(document).ready(function(){
  renderChatRoom();
})
