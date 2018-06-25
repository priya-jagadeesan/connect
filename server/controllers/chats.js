var mongoose = require('mongoose');
// const bcrypt = require('bcrypt-as-promised');
var user = mongoose.model('User');
var chat = mongoose.model('Chat');
var message = mongoose.model('Message');
// var chatroom = mongoose.model('ChatRoom');

module.exports = {
    storeChat: function (req, res) {
        // console.log("********* put("/chats/:id") - UserFriend storechat chat history *********")
        user.findOne({ _id: req.body.friend_id }, function (err, user_data) {
            if (err) {
                res.json({ message: 'error', data: err });
            } else if (user_data) {
                //check user is already has friend_id in Friends list
                if (user_data.friends.indexOf(req.params.id) < 0) {
                    user_data.friends.unshift(req.params.id);
                }
                user_data.save(function (err) {
                    if (err) {
                        res.json({ message: 'error', data: err });
                    } else {
                        //get chatHistory message _id with user_id, friend_id
                        chat.findOne({ _user: req.params.id, _friend: req.body.friend_id }, function (err, messages) {
                            if (err) {
                                res.json({ message: 'error', data: err });
                            } else if (messages) {
                                // get the chatHistory record with message _id
                                message.findOne({ _id: messages._message }, function (err, history) {
                                    if (err) {
                                        res.json({ message: 'error', data: err });
                                    } else {
                                        history.incr_val = req.body.incr_val;
                                        history.chats = req.body.history;
                                        history.save(function (err) {
                                            if (err) {
                                                res.json({ message: 'error', data: err });
                                            } else {
                                                res.json({ message: 'success', data: history });
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                // create new chatHistory if no history available
                                var new_history = new message();
                                new_history.incr_val = req.body.incr_val;
                                new_history.chats = req.body.history;

                                new_history.save(function (err) {
                                    if (err) {
                                        res.json({ message: 'error', data: err });
                                    } else {
                                        if (req.params.id != req.body.friend_id) {
                                            var new_chat1 = new chat();
                                            var new_chat2 = new chat();
                                            new_chat1._user = new_chat2._friend = req.params.id;
                                            new_chat2._user = new_chat1._friend = req.body.friend_id;
                                            new_chat1._message = new_chat2._message = new_history._id;

                                            chat.create(new_chat1, new_chat2, function (err) {
                                                if (err) {
                                                    res.json({ message: 'error', data: err });
                                                } else {
                                                    res.json({ message: 'success', data: new_history });
                                                }
                                            })
                                        } else {
                                            var new_chat = new chat();
                                            new_chat._user = req.params.id;
                                            new_chat._friend = req.body.friend_id;
                                            new_chat._message = new_history._id;

                                            chat.create(new_chat, function (err) {
                                                if (err) {
                                                    res.json({ message: 'error', data: err });
                                                } else {
                                                    res.json({ message: 'success', data: new_history });
                                                }
                                            })
                                        }

                                    }
                                })
                            }
                        })
                    }
                })
            } else {
                res.json({ message: 'error', data: { err: { message: "Server error, please try again later" } } });
            }
        })
    },

    chatHistory: function (req, res) {
        // console.log("********** post("/chats/:id") - UserFriend chatHistory **************")
        chat.findOne({ _user: req.params.id, _friend: req.body.friend_id }, function (err, messages) {
            if (err) {
                res.json({ message: 'error', data: err });
            } else if (messages) {
                // get the message record with message id
                message.findOne({ _id: messages._message }, function (err, history) {
                    if (err) {
                        res.json({ message: 'error', data: err });
                    } else {
                        res.json({ message: 'success', data: history });
                    }
                })
            }
            else {
                res.json({ message: 'success', data: "no history" });
            }
        })
    },
}