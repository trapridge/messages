var mongoose = require('mongoose');
var config = require('./config');
var restify = require('restify');

// setup mongoose & mongodb
mongoose.connect(config.creds.mongoose_auth);

// create a mongoose schema to register a model with mongodb
var MessageModel = mongoose.model('Message', new mongoose.Schema({
    message: String,
    date: Date
})); 

// setup & start server
var server = restify.createServer();
server.use(restify.bodyParser());

server.get('/messages', getMessages);
server.post('/messages', postMessage);
server.del('/messages/:id', deleteMessage);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

// request handlers
function getMessages(req, res, next) {
    MessageModel.find().sort('date asc').execFind(function (arr,data) {
        res.send(data);
    });
}

function postMessage(req, res, next) {
    var newMessage = new MessageModel();
    newMessage.message = req.params.message;
    newMessage.date = new Date();
    newMessage.save(function () {
        res.send(req.body);
    });
}

function deleteMessage(req, res, next) {
    MessageModel.findById(req.params.id, function (err, message) {
        if (err) {
            console.log(err);
            res.send(500);  
        } 
        if (message) {
            var id = message._id;
            message.remove(function (err, removed) {
                if (err) {
                    console.log(err);
                    res.send(500); 
                }
                console.log('Removed message: ' + id);
                res.send(204);
            });
        }
        else {
            res.send(404);
        }
    });
}