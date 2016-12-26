var io = require('socket.io');
var userCount = 0;
var names = ['Martin', 'Mark', 'Sally', 'Lil Wayne', 'Eminem', 'Dre', 'Xzibit', 'DMX', 'Florida', 'Jinx', 'ODB']
var users = [];
var userProto = {
  name: '',
  radius: 0,
  speed: 5,
  color: '',
  x: 150,
  y: 150,
  userId: ''
}

exports.initialize = function(server) {
  io = io.listen(server);
  io.sockets.on("connection", function(socket) {
    userCount++;
    console.log("User count is: " + userCount);
    users[userCount] = Object.create(userProto);
    var rnd = Math.floor((Math.random() * 10) + 0);
    users[userCount].name = names[rnd];
    socket.send(JSON.stringify(
      {
        type: 'serverMessage',
        message: 'Welcome to Bouncy ' + users[userCount].name + '! ' + userCount,
        userId: userCount
      }
    ));
    socket.on('message', function(message){
      message = JSON.parse(message);
      if (message.type == 'userAction') {
        socket.broadcast.send(JSON.stringify(message));
        message.type = 'myMessage';
        socket.send(JSON.stringify(message));
      }
    });
  });
};
