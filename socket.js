var io = require('socket.io');
var sanitizeHtml = require('sanitize-html');
var userCount = 0;
var names = ['Martin', 'Mark', 'Randa', 'Cyan', 'Trashy', 'Dre', 'Xzibit', 'DMX', 'Florida', 'Jinx', 'ODB']
var users = [];
var globalChatroom = [];

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
    var rnd = Math.floor((Math.random() * 10) + 0);
    var userProto = new userProtoModel(
      names[rnd],
      "rgba(" + createRandom(0,255) + ", " + createRandom(0,255) + ", " + createRandom(0,255) + ", 0.5)",
      150,
      150,
      100,
      5
      );
    globalMap.users.push(userProto);
    socket.send(JSON.stringify(
      {
        type: 'serverMessage',
        message: 'Welcome to Bouncy ' + globalMap.users[userCount].name + '! ' + userCount,
        userId: userCount,
        color: globalMap.users[userCount].color
      }
    ));
    console.log("globalMap");
    console.log(globalMap);
    socket.send(JSON.stringify(globalMap));
    userCount++;


    socket.on('message', (message) => {
      //PARSE THE MESSAGE FROM STRING BACK TO JSON
      try {
        message = JSON.parse(message);
        if (message.type == 'userAction') {
          if (message.message.radius > 160) {return;};
          if (message.message.speed > 10) {return;};
          console.log("Player message: ");
          console.log(message);
          stateBuilder(message); //add user update to globalMap
          //message.type = 'myMessage';
          io.emit('message', JSON.stringify(message));
          console.log("message sent");
        }

        if (message.type === 'textMessage') {
          const messageToSend = sanitizeHtml(message.msg);
          if (messageToSend.length < 1) {
            return;
          }
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
  });
};


var stateBuilder = (message) => {
  if (message.message.x !== undefined) {globalMap.users[message.message.userId].x = message.message.x;}
  if (message.message.y !== undefined) {globalMap.users[message.message.userId].y = message.message.y;}
  if (message.message.radius !== undefined) {globalMap.users[message.message.userId].radius = message.message.radius;}
  if (message.message.color !== undefined) {globalMap.users[message.message.userId].color = message.message.color;}
  return globalMap;
}

var createRandom = (min, max) => {
  var newRandom = Math.floor((Math.random() * max) + min);
  return newRandom;
}
