var oAuthConf = process.env.NODE_ENV === 'production' ? 
    require('./google_oauth_prod.json') : require('./google_oauth.json');

// set up passport
var passport = require('./passport-setup')(oAuthConf);

// setup restify server
var restify = require('restify');
var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());

// authentication logic routing
server.get('/auth/google', passport.authenticate('google', { 
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ], 
  session: true 
}));

server.get('/auth/google/callback', passport.authenticate('google', { 
  failureRedirect: '/login', session: true }),
  function(req, res) {
    res.header('Location', '/');
    res.send(302);
  }
);

server.get('/logout', function(req, res) {
  req.logout();
  res.header('Location', '/');
  res.send(302);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.send(401);
}

// setup mongodb vith mongoose
var models = require('./models');

// request handlers for messages api
var messageHandlers = require('./messageHandlers')(models.messages);

// messages api routing
server.get('/api/v1/messages/:id', 
  messageHandlers.getMessages);
server.get('/api/v1/messages', 
  messageHandlers.getMessages);
server.post('/api/v1/messages/:id', 
  ensureAuthenticated, messageHandlers.postMessage);
server.post('/api/v1/messages', 
  ensureAuthenticated, messageHandlers.postMessage);
server.del('/api/v1/messages/:id', 
  ensureAuthenticated, messageHandlers.deleteMessage);

// set up middleware and start server
var connect = require('connect');
connect()
  .use(connect.logger())
  .use(connect.cookieParser())
  .use(connect.session({ secret: 'saignwittis', key: 'sid' }))
  .use(passport.initialize())
  .use(passport.session())
  .use(connect.static(__dirname + '/../client/app'))
  .use(connect.compress())
  .use('/', function (req, res) { 
      server.server.emit('request', req, res);
  }).listen(3000);