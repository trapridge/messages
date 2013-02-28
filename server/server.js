var mongoose = require('mongoose');
var restify = require('restify');

// setup mongoose & mongodb
mongoose.connect('mongodb://nodejitsu_trapridge:toujvd1dh5ioock6jtliel6lo4@ds051947.mongolab.com:51947/nodejitsu_trapridge_nodejitsudb1918183083');

// register a model with mongodb using a mongoose schema to 
mongoose.model('Message', new mongoose.Schema({
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
        mongoose.model('Message').findById(req.params.id, function (err, message) {
            if (err) {
                console.log(err);
                res.send(500);  
            } 
            res.send(message);
        });
    }
    else {
        mongoose.model('Message').find().sort('date desc').execFind(function (err, data) {
            if (err) {
                console.log(err);
                res.send(500);  
            } 
            res.send(data);
        });
    }
}

function postMessage(req, res, next) {
    // update existing
    if(req.params.id) {
        // TODO: consider using update()
        mongoose.model('Message').findById(req.params.id, function (err, message) {
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
    // create new
    else {
        mongoose.model('Message').create({
                message: req.params.message, 
                date: new Date()
            }, function(err, message) {
                if (err) {
                    console.log(err);
                    res.send(500);  
                }

                console.log('Created a new message, id: ' + message._id);
                res.send(req.body);
            }
        );
    }
}

function deleteMessage(req, res, next) {
    mongoose.model('Message').findById(req.params.id, function (err, message) {
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