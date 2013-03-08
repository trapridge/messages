module.exports = function (oAuthConf) {
  var passport = require('passport');
  var OAuth2Strategy = require('passport-google-oauth').OAuth2Strategy;

  passport.use(new OAuth2Strategy({
      clientID: oAuthConf.web.client_id,
      clientSecret: oAuthConf.web.client_secret,
      callbackURL: oAuthConf.web.redirect_uris[0]
    }, function(accessToken, refreshToken, profile, done) {
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  return passport;
}