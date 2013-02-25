var mongoose = require('mongoose/');
var config = require('./config');
mongoose.connect(config.creds.mongoose_auth);

var restify = require('restify');  
var server = restify.createServer();
server.use(restify.bodyParser());

// Create a schema for our data
var MessageSchema = new mongoose.Schema({
    message: String,
    date: Date
});

// Use the schema to register a model with MongoDb
mongoose.model('Message', MessageSchema); 
var Message = mongoose.model('Message'); 

function getMessages(req, res, next) {
    Message.find().sort('date asc').execFind(function (arr,data) {
        res.send(data);
    });
}

function postMessage(req, res, next) {
    var message = new Message();

console.log(req.params)

    message.message = req.params.message;
    message.date = new Date();
    message.save(function () {
        res.send(req.body);
    });
}

server.get('/messages', getMessages);
server.post('/messages', postMessage);

server.listen(8080, function() {
    console.log('%s listening at %s, love & peace', server.name, server.url);
});