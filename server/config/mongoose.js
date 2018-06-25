var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var fs = require('fs');
var path = require('path');

var connection = mongoose.connect('mongodb://localhost/chat');

autoIncrement.initialize(mongoose.connection);

var models_path = path.join(__dirname, './../models');
fs.readdirSync(models_path).forEach(function(file) {
  if(file.indexOf('.js') >= 0) {
    require(models_path + '/' + file);
  }
});
