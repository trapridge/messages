// var handlers = require('./handlers.js');
var oAuthConf = process.env.NODE_ENV === 'production' ? 
    require('./google_oauth_prod.json') : require('./google_oauth.json');
// // set up passport-google
var passport = require('passport');
var OAuth2Strategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new OAuth2Strategy({
    clientID: oAuthConf.web.client_id,
    clientSecret: oAuthConf.web.client_secret,
    callbackURL: oAuthConf.web.redirect_uris[0]
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    // process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    // });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// setup mongoose & mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://nodejitsu_trapridge:toujvd1dh5ioock6jtliel6lo4@ds051947.mongolab.com:51947/nodejitsu_trapridge_nodejitsudb1918183083');
// register a model with mongodb using a mongoose schema to 
mongoose.model('Message', new mongoose.Schema({
    message: String,
    date: Date
})); 

// setup server
var restify = require('restify');
var server = restify.createServer();
server.pre(function(req, res, next) {
    if(req.url === '/') req.url = '/index.html';
    return next();
});
// server.use(restify.gzipResponse());
server.use(restify.queryParser());
server.use(restify.bodyParser());
// // initialize passport
// server.use(passport.initialize());
// server.use(passport.session());
server.use(function (req, res, next) {
  var send = res.send;
  res.send = function(body){
    res.send = send;
    res.send(body);
    if (body instanceof Error) {
      console.log('SENT ERROR: ');
      console.dir(body.toString());
    }
  };

  next();
});

// server.listen(3000);
// Connect config here
var connect = require('connect');
connect()
    .use(connect.logger())
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'saignwittis', key: 'sid' }))
    .use(passport.initialize())
    .use(passport.session())
    .use("/", function (req, res) { 
        server.server.emit('request', req, res);
    }).listen(3000);

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
server.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  // function(req, res) {
  //   res.redirect('/');
  // }

function(req, res) {
    console.log('we b logged in!')
    console.dir(req.user)
    // be sure to send a response
    // res.send('Welcome ' + JSON.stringify(req.user._json.email));

    res.header('Location', '/');
    res.send(302);

  }
);

server.get('/logout', function(req, res){
  req.logout();
      res.header('Location', '/');
    res.send(302);
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
server.get('/auth/google',
    passport.authenticate('google', { 
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ], 
        session: true 
    }),
    function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
    });


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.send(401);
}

server.get('/api/v1/messages/:id', getMessages);
server.get('/api/v1/messages', getMessages);
server.post('/api/v1/messages/:id', postMessage);
server.post('/api/v1/messages', postMessage);
server.del('/api/v1/messages/:id', ensureAuthenticated, deleteMessage);
server.get(/\/*/, restify.serveStatic({
    directory: './client/app'
}));

// request handlers
function getMessages(req, res, next) {
    if(req.params.id) {
        mongoose.model('Message').findById(req.params.id, 
        function (err, message) {
            if (err) {
                console.log(err);
                res.send(500);  
            } 
            res.send(message);
        });
    }
    else {
        mongoose.model('Message').find().sort('-date').execFind(function (err, data) {
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
            } else {
                res.send(404);
            }
        });
    }
    // create new
    else {
        var m = { 
            message: req.params.message, 
            date: new Date() 
        };

        mongoose.model('Message').create(m, function(err, message) {
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
        } else {
            res.send(404);
        }
    });
}
