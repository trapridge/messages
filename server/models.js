module.exports = (function () {
  var mongoose = require('mongoose');

  mongoose.connect('mongodb://nodejitsu_trapridge:'
    + '@ds051947.mongolab.com:51947'
    + '/nodejitsu_trapridge_nodejitsudb1918183083');

  var messageModel = mongoose.model('Message', new mongoose.Schema({
    message: String,
    date: Date
  }));

  return {
    messages: messageModel
  }
})();
