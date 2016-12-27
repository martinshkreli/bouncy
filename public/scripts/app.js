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

  if(data.type == "map"){
    map = data; //make this map message smaller
  };

  if (data.type == "serverMessage") {
    $('#messages').append($('<ul>').text(data.message));
    user.userId = data.userId;
    user.color = data.color;
  };
});

var drawCircle = function(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2*Math.PI);
  ctx.stroke();
}

var c = document.getElementById("game");
var ctx = c.getContext("2d");
var x = 0;
var y = 0;

window.onkeydown = function(e) {
  //e.preventDefault();
   var key = e.keyCode ? e.keyCode : e.which;

   if (key == 38) {
     user.y -= user.speed;
     var data = {
       type: 'userAction',
       message: {
         y: user.y,
         userId: user.userId
       }
     };
     socket.send(JSON.stringify(data));
   } else if (key == 40) { //down
     user.y += user.speed;
     var data = {
       type: 'userAction',
       message: {
         y: user.y,
         userId: user.userId
       }
     };
     socket.send(JSON.stringify(data));
   } else if (key == 39) {
     user.x += user.speed;
     var data = {
       type: 'userAction',
       message: {
         x: user.x,
         userId: user.userId
       }
     };
     socket.send(JSON.stringify(data));
   } else if (key == 83) { //S key
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
   } else if (key == 37 || key == 100) { //LEFT
     user.x -= user.speed;
     var data = {
       type: 'userAction',
       message: {
         x: user.x,
         userId: user.userId
       }
     };
     socket.send(JSON.stringify(data));
   } else if (key == 67) {
     user.color = "rgba(" + createRandom(0,255) + ", " + createRandom(0,255) + ", " + createRandom(0,255) + ", 0.5)";
     var data = {
       type: 'userAction',
       message: {
         userId: user.userId,
         color: user.color
       }
     };
      socket.send(JSON.stringify(data));
   }
}

var programStart = function() {
  setInterval(render, 10);
}

var clearBackground = function() {
  ctx.fillStyle = 'white'
  ctx.fillRect(0,0,1200,800);
};

var render = function() {
  clearBackground();
  renderMap();
};

var renderMap = function() {
  for(var n = 0; n < map.users.length; n++){
    if(map.users[n] == undefined) {continue};
    if(map.users[n] == null) {continue};
    if(map.users[n].x == undefined ) {continue};
    if(map.users[n].x == null ) {continue};
    ctx.fillStyle = map.users[n].color;
    drawCircle(map.users[n].x, map.users[n].y, map.users[n].radius);
    ctx.fill();
  }
  //ctx.fillText(user.userId, 10, 500);
};

//drawCircle (user.x, user.y, user.radius);
programStart();
