var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var Schema = mongoose.Schema;

var ChatSchema = new mongoose.Schema({
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    _friend: { type: Schema.Types.ObjectId, ref: 'User' },
    _message: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

var MessageSchema = new mongoose.Schema({
    incr_val: { type: Number },
    chats: []
}, { timestamps: true });

var ChatRoomSchema = new mongoose.Schema({
    from: { type: String }, 
    content: { type: String }, 
}, { timestamps: true });

ChatRoomSchema.plugin(autoIncrement.plugin, { model: 'ChatRoom', field: 'ID',startAt: 1,incrementBy: 1 });
mongoose.model('Chat', ChatSchema);
mongoose.model('ChatRoom', ChatRoomSchema);
mongoose.model('Message', MessageSchema);