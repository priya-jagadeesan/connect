var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        unique: [true, 'Name Taken'],
        required: [true, 'User Name required'],
        minlength: [5, 'User name needs to be more than 5 characters'],
        maxLength: [8, 'Limit User name to 8 characters'],
        validate: [{
            validator: function (name) {
                return /^[a-zA-Z0-9]+$/.test(name);
            },
            message: "Invalid User Name. Only alphanumeric characters allowed"
        }],
    },
    email: {
        type: String,
        unique: [true, 'Email address already exists'],
        validate: [{
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: "Invalid email address"
        }],
        required: [true, "Email address required"],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password required'],
        minlength: [6, 'Password needs to be more than 6 characters']
    },
    image: {
        path: {
            type: String,
            trim: true
        },
        mimeType: {
            type: String,
            trim: true
        },
        imageSrc: {
            type: String,
            trim: true
        }
    },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    created_at: { type: Date, default: Date.now() },
    updated_at: { type: Date, default: Date.now() }
});

UserSchema.plugin(uniqueValidator, { message: "{PATH} already exists, please login if returning user" });
mongoose.model('User', UserSchema);