var mongoose = require('mongoose');
var restify = require('restify');

// setup mongoose & mongodb
mongoose.connect('mongodb://nodejitsu_trapridge:toujvd1dh5ioock6jtliel6lo4@ds051947.mongolab.com:51947/nodejitsu_trapridge_nodejitsudb1918183083');

// create a mongoose schema to register a model with mongodb
var MessageModel = mongoose.model('Message', new mongoose.Schema({
    message: String,
    date: Date
})); 

// setup server
var server = restify.createServer();
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
server.pre(function(req, res, next) {
    if(req.url === '/') req.url = '/index.html';
    return next();
});

// Set routes
server.get('/api/v1/messages/:id', getMessages);
server.get('/api/v1/messages', getMessages);
server.post('/api/v1/messages/:id', postMessage);
server.post('/api/v1/messages', postMessage);
server.del('/api/v1/messages/:id', deleteMessage);
server.get(/\/*/, restify.serveStatic({
    directory: './client/app'
}));

// start server
server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});

// request handlers
function getMessages(req, res, next) {
    if(req.params.id) {
        MessageModel.findById(req.params.id, function (err, message) {
            if (err) {
                console.log(err);
                res.send(500);  
            } 
            res.send(message);
        });
    }
    else {
        MessageModel.find().sort('date asc').execFind(function (err, data) {
            if (err) {
                console.log(err);
                res.send(500);  
            } 
            res.send(data);
        });
    }
}

function postMessage(req, res, next) {
    if(req.params.id) {
        MessageModel.findById(req.params.id, function (err, message) {
            if (err) {
                console.log(err);
                res.send(500);  
            } 
            if (message) {
                message.message = req.params.message;
                message.save(function (err, savedMessage) {
                    if (err) {
                        console.log(err);
                        res.send(500);  
                    } 
                    console.log('Updated message ' + savedMessage._id);
                    res.send(200);
                });
            }
            else {
                res.send(404);
            }
        });
    }
    else {
        var newMessage = new MessageModel();
        newMessage.message = req.params.message;
        newMessage.date = new Date();
        newMessage.save(function (err, newMessage) {
            if (err) {
                console.log(err);
                res.send(500);  
            } 
            console.log('Created a new message, id: ' + newMessage._id);
            res.send(req.body);
        });
    }
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
                console.log('Removed message ' + id);
                res.send(204);
            });
        }
        else {
            res.send(404);
        }
    });
}