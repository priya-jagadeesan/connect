const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client/dist'));
// app.use(express.static('./server/assets'));

require('./server/config/mongoose.js');

const routes_setter = require('./server/config/routes.js');
routes_setter(app);
const port = 8000;

const server = require('http').Server(app);
const io = require('socket.io')(server);

var online_users = {};
var meesages_to_offline_users = {};

// listen when new user connection made
io.on('connection', (socket) => {
  var active_user_id, my_socket_id, active_user_name;
  var active_user = {};

  // listen for active user connection
  socket.on('active', (data) => {
    active_user_id = data['active_user_id'];
    active_user_name = data['active_user_name'];
    my_socket_id = socket.id;

    active_user = {
      'socket_id': my_socket_id,
      'user_name': active_user_name
    }

    online_users[active_user_id] = active_user;

    // emit all active user connections
    io.emit('online_users', {
      online_users: online_users
    });

    if (meesages_to_offline_users[active_user_id]) {
      io.to(my_socket_id).emit('offline_messages', {
        offline_messages: meesages_to_offline_users[active_user_id]
      });
      delete meesages_to_offline_users[active_user_id];
    }
  });

  // listen for friend IM chat
  socket.on('user_friend_chat', (data) => {
    var user_id = data.user_id;
    var friend_id = data.friend_id;
    var to_socket_id;

    if (online_users[friend_id]) {
      to_socket_id = online_users[friend_id]['socket_id'];
    } 
    else {
      if (meesages_to_offline_users[friend_id]) {
        meesages_to_offline_users[friend_id].push({
          user_name: data.user_name,
          user_id: data.user_id,
          user_status: online_users[friend_id] ? true : false
        });
      } else {
        meesages_to_offline_users[friend_id] = [{ user_name: data.user_name, user_id: data.user_id, user_status: data.user_id ? true : false }]
      }
    } 

    // emit new message from friend for New message alert
    if (to_socket_id) {
      socket.to(to_socket_id).emit('new_message', {
        from: user_id,
        from_name: data.user_name,
        to: friend_id,
        friend_status: data.friend_status
      });
    }
  });

  // listeb for new chatroom messages
  socket.on('cr_newMessage', data => {
    if (data.from) {
      // broadcast new chat room message for Chat room message alert
      socket.broadcast.emit('cr_message_alert', { from: data.from });
    }
  })

  // listen for user connection logout
  socket.on('user_logout', data => {
    delete online_users[active_user_id]
    setTimeout(function () {
      // broadcast for user connection logout to other users
      if (!online_users[active_user]) {
        socket.broadcast.emit('online_users', {
          online_users: online_users
        });
      }
    }, 5000);
  })

  // listen for user disconnection
  socket.on('disconnect', function () {
    delete online_users[active_user_id]
    setTimeout(function () {
      // broadcast for user disconnection to other users
      if (!online_users[active_user]) {
        socket.broadcast.emit('online_users', {
          online_users: online_users
        });
      }
    }, 5000);
  });
});

server.listen(port);