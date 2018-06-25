var mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');
// var user = mongoose.model('User');
// var chat = mongoose.model('Chat');
// var message = mongoose.model('Message');
var chatroom = mongoose.model('ChatRoom');

module.exports = {
    storeChat: function (req, res) {
        // console.log("********* put("/chatroom") - storechat chatroom history *********")
        chatRoom_messages = new chatroom();
        chatRoom_messages.from = req.body.from;
        chatRoom_messages.content = req.body.content;
        chatRoom_messages.save(function (err) {
            if (err) {
                res.json({ message: 'error', data: err });
            } else {
                res.json({ message: 'success', data: chatRoom_messages });
            }
        })
    },

    chatHistory: function (req, res) {
        // console.log("********* get("/chatroom") - storechat chatroom history *********")
        chatroom.find({}, function (err, messages) {
            if (err) {
                res.json({ message: 'error', data: err });
            } else {
                res.json({ message: 'success', data: messages });
            }
        })
    },
}