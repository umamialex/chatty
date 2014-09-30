var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, bookshelf) {
    var User = require('./user.js')(bookshelf);

    passport.serializeUser(function(user, done) {
        done(null, user.get('email'));
    });

    passport.deserializeUser(function(email, done) {
        new User({ email: email }).fetch().then(function(user) {
            done(null, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(request, email, password, done) {
        new User({ email: email }).fetch().then(function(user) {
            if (user === null) {
                var newUser = new User({ email: email });
                    newUser.set({
                               password: newUser.hashPassword(password),
                               name: request.body.name
                           })
                           .save(null, { method: 'insert' })
                           .then(function(user) {
                               user.createMessagesTable(done);
                           });
            } else {
                if (user.validatePassword(password)) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            }

        });
    }));
};
