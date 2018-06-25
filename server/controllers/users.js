var mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');
var user = mongoose.model('User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = {
    display: function (req, res) {
        // console.log("*************** get("/users") - display all users **************")
        user.find({}, { name: 1, email: 1, friends: 1, image: 1 }, function (err, users) {
            if (err) {
                res.json({ message: 'error', data: err });
            } else {
                res.json({ message: 'success', data: users });
            }
        })
    },

    create: function (req, res) {
        // console.log("******** post("/users") - register new user **************")
        var new_User = new user();
        new_User.name = req.body.name;
        new_User.email = req.body.email.toLowerCase();
        if (req.body.password.length < 6) {
            res.json({ message: 'error', data: { err: { message: 'Password required' } } });
        } else {
            bcrypt.hash(req.body.password, 10).then(hashed_password => {
                new_User.password = hashed_password;
                new_User.save(function (err) {
                    if (err) {
                        res.json({ message: 'error', data: err });
                    } else {
                        res.json({ message: 'success', data: new_User });
                    }
                })
            }).catch(error => {
                res.json({ message: 'error', data: { err: { message: "Server error, please try again later" } } });
            });
        }
    },

    getUserID: function (req, res) {
        // console.log("********** post("/user") - login old user **************")
        user.findOne({ name: req.body.name }, function (err, user_data) {
            if (err) {
                res.json({ message: 'error', data: err });
            }
            else if (!user_data) {
                res.json({ message: 'error', data: { errors: { message: 'Invalid credentials' } } });
            }
            else {
                bcrypt.compare(req.body.password, user_data.password)
                    .then(result => {
                        res.json({ message: 'success', data: user_data });
                    })
                    .catch(error => {
                        //validation failure
                        res.json({ message: 'error', data: { errors: { message: 'Invalid credentials' } } });
                    })
            }
        })
    },

    show: function (req, res) {
        // console.log("********** get("/users/:id") - logged in user details **********")
        user.findOne({ _id: req.params.id }, { name: 1, email: 1, friends: 1, image: 1 })
            // .populate({ path: 'friends', options: { sort: { 'name': -1 } } })
            .populate({ path: 'friends', select: 'name email friends image'})
            .exec(function (err, friends) {
                if (err) {
                    res.json({ message: 'error', data: err });
                } else {
                    res.json({ message: 'success', data: friends });
                }
            })
    },

    newFriend: function (req, res) {
        // console.log("*********** put("/users/:id") - adding new user Friend ************")
        user.findOne({ _id: req.params.id }, function (err, user_data) {
            if (err) {
                res.json({ message: 'error', data: err });
            } else if (user_data) {
                // need to check if newFriend already in user friend list
                user_data.friends.unshift(req.body.friend_id);

                user_data.save(function (err) {
                    if (err) {
                        res.json({ message: 'error', data: err });
                    } else {
                        res.json({ message: 'success', data: user_data });
                    }
                })
            } else {
                res.json({ message: 'error', data: { err: { message: "Server error, please try again later" } } });
            }
        })
    },

    addFriends: function (req, res) {
        // console.log("*********** get("/friends/:id") - all user Not friends ************")
        user.findOne({ _id: req.params.id }, function (err, user_data) {
            if (err) {
                res.json({ message: 'error', data: err });
            } else if (user_data) {
                // user_data.friends.push(user_data._id);
                user.find({ _id: { $nin: user_data.friends } }, { name: 1, email: 1, image: 1 }, function (err, friends) {
                    if (err) {
                        res.json({ message: 'error', data: err });
                    } else {
                        res.json({ message: 'success', data: friends });
                    }
                })
            } else {
                res.json({ message: 'error', data: { err: { message: "Server error, please try again later" } } });
            }
        })
    },

    storeImage: function (req, res) {
        // console.log("********* post("/users/image/:id") - user store Image ***********")
        const storage = multer.diskStorage({
            destination: './server/assets',
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            }
        })
        const upload = multer({
            storage: storage,
            // limits: {fileSize: 10},
            fileFilter: function (req, file, cb) {
                checkfiletype(file, cb);
            }
        }).single('profileImage');

        function checkfiletype(file, cb) {
            const fileTypes = /jpeg|jpg|png|gif/;
            const extName = fileTypes.test(path.extname(file.originalname.toLowerCase()));
            const mimeType = fileTypes.test(file.mimetype);
            if (extName && mimeType) {
                return cb(null, true);
            } else {
                cb('Error: Images only!')
            }
        }

        upload(req, res, (err) => {
            if (err) {
                res.json({ message: 'error', data: err });
            } else {
                user.findOne({ _id: req.params.id }, function (err, user_data) {
                    if (err) {
                        res.json({ message: 'error', data: err });
                    } else if (user_data) {
                        user_data.image.path = req.file.path;
                        user_data.image.mimeType = req.file.mimetype;
                        user_data.image.imageSrc = "data:" + user_data.image.mimeType + ";base64," + new Buffer(fs.readFileSync(user_data.image.path)).toString("base64");

                        user_data.save(function (err) {
                            if (err) {
                                res.json({ message: 'error', data: err });
                            } else {
                                // imageSrc = "data:" + user_data.image.mimeType + ";base64," + new Buffer(fs.readFileSync(user_data.image.path)).toString("base64");
                                res.json({ message: 'success', data: user_data });
                            }
                        })
                    } else {
                        res.json({ message: 'error', data: { err: { message: "Server error, please try again later" } } });
                    }
                })
            }
        })
    },
}