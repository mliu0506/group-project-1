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

var gameID = "";
var userKey = "";
var photo ="";
var name = "";
var googleLogin = false;

//Goggle Sign In function
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var ID = profile.getId();
  var email = profile.getEmail();
  //store the photo URL & Name
  photo = profile.getImageUrl();
  name = profile.getName();
  googleLogin = true;
  userKey = ID;
  usersRef.child(userKey).update({uID:ID,name,name,photo:photo,email:email,status:"online",lastdisconnect:""});
  console.log("Sign-in User key :" + userKey);
  $(".user-photo").html("<img class='rounded-circle' src="+ photo +" alt='avatar' />");
  $(".chat-with").text(name);

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
  location.reload(); // refresh
});

//Log in function
$("#signin").on("click", function() {
  if (googleLogin === true) { 
    onSignIn(googleUser); // Google login
  }
  location.reload(); // refresh
});

function renderChatRoomHeader() {
  // when ever the user DB value is being update, the following function will be trigger
  usersRef.on("child_added", function(childsnapshot) {
    console.log("Chat Room User key :" + userKey);
   if (childsnapshot.key === userKey){
      var photo = childsnapshot.val().photo;
      var name = childsnapshot.val().name;
      console.log("Photo:" + childsnapshot.val().photo);
      console.log("Name:" + childsnapshot.val().name);
      $(".user-photo").html("<img class='rounded-circle' src="+ photo +" alt='avatar' />");
      $(".chat-with").text(name);
   }
    });

  }


  function renderUserList() {
    // when ever the user DB value is being update, the following function will be trigger
    usersRef.once("value", function(childsnapshot) {
      console.log("User List :" + userKey);
      childsnapshot.forEach(function(child) {
     
          if (child.key === userKey){
              var photo = childsnapshot.val().photo;
              var name = childsnapshot.val().name;
              var status = childsnapshot.val().status; 
              var lastdisconnect = childsnapshot.val().lastdisconnect;
              console.log("Name:" + childsnapshot.val().name);
              console.log("Status:" + childsnapshot.val().status); 
              $(".list").append(" <div class='clearfix'><img class='rounded-circle' src="+ photo +" alt='avatar' /><div class='about'><div class='name'>" + name + "</div><div class='status'><i class='fa fa-circle offline'></i>" + lastdisconnect+"</div></div></div>");

  
          }
      });
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
     // var userList = ['people-list', this.options];
      var noItems = $('<li id="no-items-found">No items found</li>');
      
      //userList.on('updated', function(list) {
      //  if (list.matchingItems.length === 0) {
      //    $(list.list).append(noItems);
      //  } else {
      //    noItems.detach();
      //  }
      //});
    }
  };
  
  searchFilter.init();
  
})();

$(document).ready(function(){
  renderChatRoomHeader();
})
