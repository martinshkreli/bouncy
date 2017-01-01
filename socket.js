var io = require('socket.io');
var sanitizeHtml = require('sanitize-html');
var userCount = 0;
var names = ['Martin', 'Mark', 'Randa', 'Cyan', 'Trashy', 'Dre', 'Emily', 'Speakeasy', 'Florida', 'Jinx', 'ODB']
var users = [];
var globalChatroom = [];
var auths = [];
var createRandom = function (min, max) {
  var newRandom = Math.floor((Math.random() * max) + min);
  return newRandom;
}
class userProtoModel {
  constructor(name, color, x, y, radius, speed) {
    this.name = '';
    this.color = color;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
  }
}
var globalMap = {
  type: 'map',
  users: []
}

exports.initialize = function(server) {
  io = io.listen(server);

  io.sockets.on("connection", function(socket) {


          socket.send(JSON.stringify(
            {
              type: 'connection',
              cookie: socket.handshake.headers.cookie
            }
          ));
          console.log("handshake data");
          console.log(socket.handshake.headers);
          if (socket.handshake.headers == undefined) {return;}
          console.log("userCount: " + userCount);
          if (!socket.handshake.headers.cookie) {return;}
          else {
            auths.push(socket.handshake.headers.cookie);
          }


    var rnd = createRandom(0,10);
    var userProto = new userProtoModel(
      names[rnd],
      "rgba(" + createRandom(0,255) + ", " + createRandom(0,255) + ", " + createRandom(0,255) + ", 0.5)",
      createRandom(100,1000), createRandom(100,700), 50, 5
    );

    console.log("userCount: " + userCount);
    globalMap.users[userCount] = userProto;

    socket.send(JSON.stringify(
      {
        type: 'serverMessage',
        message: 'Welcome to Bouncy ' + globalMap.users[userCount].name + '! ' + userCount,
        userId: userCount,
        x: globalMap.users[userCount].x,
        y: globalMap.users[userCount].y,
        color: globalMap.users[userCount].color,
        radius: globalMap.users[userCount].radius
      }
    ));

    console.log("globalMap");
    console.log(globalMap);
    socket.send(JSON.stringify(
      {
        type: 'mapMessage',
        message: globalMap
      }
    ));
    console.log('user count was: ' + userCount);
    console.log('auth for this instance is: ' + auths[userCount]);
    userCount++;
    console.log('user count is: ' + userCount);

    socket.on('message', (message) => {
      //PARSE THE MESSAGE FROM STRING BACK TO JSON
      try {
        message = JSON.parse(message);

        if (message.type == 'userAction') {

          if (auths[((message.message.userId) - 1)] == message.message.auth
             || auths[message.message.userId] == message.message.auth
             || auths[((message.message.userId) + 1)] == message.message.auth ) {
            console.log("auth passed");
          }
          else {
            console.log('auth failed');
            throw ("auth failed");
          }

          if (message.message.radius > 110) {return;};
          if (message.message.radius < 10) {return;};

          if (message.message.speed > 10) {return;};

          //console.log("Player message: ");
          //console.log(message);

          var verify = stateBuilder(message); //add user update to globalMap
          //message.type = 'myMessage';
          if (verify == true) {
            console.log("verify passed");
            io.emit('message', JSON.stringify(message));
          } else {
            console.log("verify failed");
            return;
          }

        }

        if (message.type === 'disconnection') {
          console.log(message.message.userId + " disconnected");
        }

        if (message.type === 'textMessage') {
          const messageToSend = sanitizeHtml(message.msg);
          if (messageToSend.length < 1) {
            return;
          }
          if (messageToSend.length > 20) {
            return;
          }
          if (messageToSend.indexOf("fuck") != -1) {return;};
          if (messageToSend.indexOf("fuk") != -1) {return;};
          console.log('message recieved %s', messageToSend);
          globalChatroom.push(messageToSend);
          // Prepare to send the global chatroom to all users.
          const payload = {
            type: 'messages',
            chats: globalChatroom
          };
          // And.. Send.
          socket.send(JSON.stringify(payload));

          // And then emit to all other users too.
          socket.broadcast.send(JSON.stringify(payload));
        }
      } catch (x) {
          if (users[userCount] === 'undefined') {return}
          console.log(x);
        }
    });

    socket.on('disconnect', function() {
      console.log('user disconnected');
    });

  });
};


var stateBuilder = (message) => {

//CHECK IF THERE IS A COLLISION

if (message.message.x) {
  var radiusValue
  var passedCheck = true;
  for (var i = 0; i < globalMap.users.length; i++) {
    if (message.message.radius) {
      radiusValue = message.message.radius;
    } else {
      radiusValue = globalMap.users[message.message.userId].radius;
    }
    if (i == message.message.userId) {continue;}

    console.log("Checking user: " + i);
    console.log("User's x value is: " + globalMap.users[i].x);
    console.log("Compared to my : " + message.message.x);
    console.log("and: " + radiusValue);

    if (Math.abs(globalMap.users[i].x - message.message.x) < 5 ) {
      console.log(globalMap.users[i].x);
      console.log(message.message.x);
      console.log("difference is");
      console.log(globalMap.users[i].x - message.message.x);
      console.log("COLLISION DETECTED");
      passedCheck = false;
      return passedCheck;
    }
  }
};

if (message.message.y) {
  var secondRadiusValue;
  var passedCheck = true;
  for (var i = 0; i < globalMap.users.length; i++) {
    if (message.message.radius) {
      radiusValue = message.message.radius;
    } else {
      radiusValue = globalMap.users[message.message.userId].radius;
    }
    if (i == message.message.userId) {continue;}

    console.log("Checking user: " + i);
    console.log("User's x value is: " + globalMap.users[i].y);
    console.log("Compared to my : " + message.message.y);
    console.log("and: " + radiusValue);

    if (Math.abs(globalMap.users[i].y - message.message.y) < 5 ) {
      console.log("COLLISION DETECTED");
      passedCheck = false;
      return passedCheck;
    }
  }
};

//CHECK IF THE MESSAGE HAS CONTENT IN EACH PROPERTY. IF SO, AMEND THE GLOBAL MAP
  if (message.message.x !== undefined) {
    globalMap.users[message.message.userId].x = message.message.x;
  }
  if (message.message.y !== undefined) {
    globalMap.users[message.message.userId].y = message.message.y;
  }
  if (message.message.radius !== undefined) {
    globalMap.users[message.message.userId].radius = message.message.radius;
  }
  if (message.message.color !== undefined) {
    globalMap.users[message.message.userId].color = message.message.color;
  }
  return passedCheck;
}

var createRandom = (min, max) => {
  var newRandom = Math.floor((Math.random() * max) + min);
  return newRandom;
}
