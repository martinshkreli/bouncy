$(function() {

var c = document.getElementById("game");
var ctx = c.getContext("2d");

var socket = io.connect('/');
var map = {
  type: 'map',
  users: []
}
var user = {
  name: '',
  radius: 100,
  speed: 5,
  color: '',
  x: 150,
  y: 150,
  userId: 0
}
var users = [];
//map.users[0] = user;

var createRandom = function (min, max) {
  var newRandom = Math.floor((Math.random() * max) + min);
  return newRandom;
}

socket.on('message', function(data){
  data = JSON.parse(data);

  if (data.type === 'messages') {
    const allChatMessages = data.chats;
    const listElements = $('#chatroom-messages').children();
    if (listElements.length.length < 1) {
      for (var i = 0; i < allChatMessages.length; i++) {
        $("#chatroom-messages").append('<li>' + allChatMessages[i] + '</li>')
      }
    } else {
        $("#chatroom-messages").append('<li>' + allChatMessages.pop() + '</li>')
    }
  }
  if(data.type === "map"){
    map = data; //TODO: make this map message smaller
    render();
    // Let's render here instead of doing it every 10 ms. This could help ease load.
  };

  if (data.type === "serverMessage") {
    $('#messages').append($('<ul>').text(data.message));
    user.userId = data.userId;
    user.color = data.color;
  };

  if (data.type === "userAction") {
    renderUpdate(data);
  };

});

var drawCircle = function(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2*Math.PI);
  ctx.stroke();
}




var x = 0;
var y = 0;

window.onkeydown = function(e) {
  //e.preventDefault();
   var key = e.keyCode ? e.keyCode : e.which;

   if (key === 38 || key === 104) { //up
     if ((user.y - user.radius + 5)  < 10) {return;};
     user.y -= user.speed;
     sendPosition();
   } else if (key === 40 || key === 98) { //down
     if ((user.y + user.radius + 5) > 800) {return;};
     user.y += user.speed;
     sendPosition();
   } else if (key === 39 || key === 102) { //right
     if (user.x + user.radius + 5 > 1200) {return;};
     user.x += user.speed;
     sendPosition();
   } else if (key === 83) { //S key
     if (user.speed > 10) {
       ctx.fillStyle = 'black';ctx.font = '80px Arial';
       ctx.fillText("max speed!", 50, 200);
     } else {
       user.speed = user.speed * 1.05;
       user.radius = user.radius * 0.95;
     };
     var data = {
       type: 'userAction',
       message: {
         userId: user.userId,
         radius: user.radius
       }
     };
     socket.send(JSON.stringify(data));
   } else if (key === 37 || key === 100) { //LEFT
     if (user.x - user.radius - 5 < 0) {return;};
     user.x -= user.speed;
     sendPosition();
   } else if (key === 105) { //keypad 9
     if (user.x + user.radius + 5 > 1200) {return;};
     if ((user.y - user.radius + 5)  < 10) {return;};
     user.x += user.speed;
     user.y -= user.speed;
     sendPosition();
     socket.send(JSON.stringify(data));
   } else if (key === 103) { //keypad 7
     if ((user.y - user.radius + 5)  < 10) {return;};
     if (user.x - user.radius - 5 < 0) {return;};
     user.x -= user.speed;
     user.y -= user.speed;
     sendPosition();
   } else if (key === 97) { //keypad 1
     if ((user.y + user.radius + 5) > 800) {return;};
     if (user.x - user.radius - 5 < 0) {return;};
     user.x -= user.speed;
     user.y += user.speed;
     sendPosition();
   } else if (key === 99) { //keypad 3
     if (user.y + user.radius + 5 > 800) {return;};
     if (user.x + user.radius + 5 > 1200) {return;};
     user.x += user.speed;
     user.y += user.speed;
     sendPosition();
   } else if (key === 67) { //C
     user.color = "rgba(" + createRandom(0,255) + ", " + createRandom(0,255) + ", " + createRandom(0,255) + ", 0.5)";
     var data = {
       type: 'userAction',
       message: {
         userId: user.userId,
         color: user.color
       }
     };
      socket.send(JSON.stringify(data));
   } else if (key === 68) { //V
     console.log(map);
   }
}

var clearBackground = function() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,1200,800);
};

var render = function() {
  clearBackground();
  renderMap();
  ctx.fillStyle = 'black'; ctx.font = '18px Arial';
  ctx.fillText("Number connected: " + map.users.length, 0, 750);
};

var renderMap = function() {
  for(var n = 0; n < map.users.length; n++){
    if(map.users[n] === undefined) {continue};
    if(map.users[n] === null) {continue};
    if(map.users[n].x === undefined ) {continue};
    if(map.users[n].x === null ) {continue};
    ctx.fillStyle = map.users[n].color;
    drawCircle(map.users[n].x, map.users[n].y, map.users[n].radius);
    ctx.fill();
  }
  //ctx.fillText(user.userId, 10, 500);
};

var renderUpdate = function(data) {
    //look up current value for specific user in client-side userMap
    if(map.users[data.message.userId] === undefined) {map.users[data.message.userId] = {}};
    if(data.message.x != undefined) {map.users[data.message.userId].x = data.message.x};
    if(data.message.y != undefined) {map.users[data.message.userId].y = data.message.y};
    if(data.message.color != undefined) {map.users[data.message.userId].color = data.message.color};
    if(data.message.radius != undefined) {map.users[data.message.userId].radius = data.message.radius};
    render();
};

//drawCircle (user.x, user.y, user.radius);
// programStart();

$('#send').on('click', function (clicked) {
  const messageToSend = $('#message').val();
  if (messageToSend.length < 1) {
    alert('Make sure to actually write a message!');
    return;
  }
  if (messageToSend.length > 20) {
    alert('Make sure to actually write a message!');
    return;
  }

  var payload = {
    type: 'textMessage',
    msg: messageToSend
  };

  socket.send(JSON.stringify(payload));

});


var sendPosition = function() {
  var data = {
    type: 'userAction',
    message: {
      x: user.x,
      y: user.y,
      userId: user.userId
    }
  };
  socket.send(JSON.stringify(data));
};
})
