var users = require('../controllers/users.js');
var chats = require('../controllers/chats.js');
var chatroom = require('../controllers/chatroom.js');
var path = require('path');

module.exports = function (app) {
    //=========================="GET" root route======================================//
    app.get("/", function (req, res) {
        res.send("Welcome to Connect. Server loading, refresh browser.")
    })
    //=========================="Users" all users ====================================//
    app.get("/users", function (req, res) {
        users.display(req, res);
    })
    //=========================="Register" new user===================================//
    app.post("/users", function (req, res) {
        users.create(req, res);
    })
    //========================"Login" validate user===================================//
    app.post("/user", function (req, res) {
        users.getUserID(req, res);
    })
    //====================="User Friends" logged in user details======================//
    app.get("/users/:id", function (req, res) {
        users.show(req, res);
    })
    //====================="User Image" logged in user image==========================//
    app.post("/users/image/:id", function (req, res) {
        users.storeImage(req, res);
    })
    //====================="Add Friends" logged user NotFriends======================//
    app.get("/friends/:id", function (req, res) {
        users.addFriends(req, res);
    })
    //=================="New/Add Friends" logged user newfriend======================//
    app.put("/users/:id", function (req, res) {
        users.newFriend(req, res);
    })
    //==========="Friend Chat history" logged userFriend chat history ===============//
    app.post("/chats/:id", function (req, res) {
        chats.chatHistory(req, res);
    })
    //========="Friend Save chat history" logged userFriend store chat history=======//
    app.put("/chats/:id", function (req, res) {
        chats.storeChat(req, res);
    })
    //=============="ChatRoom" store chat room conversation==========================//
    app.put("/chatroom", function (req, res) {
        chatroom.storeChat(req, res);
    })
    //=============="ChatRoom" get chat room conversation===========================//
    app.get("/chatroom", function (req, res) {
        chatroom.chatHistory(req, res);
    })
    //================"ALL other routes" route back to client======================//
    app.all("*", (req, res, next) => {
        res.sendFile(path.resolve("./client/dist/index.html"))
    });
}