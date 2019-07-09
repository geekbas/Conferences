
var fs = require('fs')
var session = require('express-session')
var passport = require('passport')
//    , TwitterStrategy = require('passport-twitter').Strategy
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// TODO: twitter, et al

const do_auth = function(app) {
    app.use(session({
        secret: 'very secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            //secure: true -- only if https
        }
    }))
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new GoogleStrategy(require('./google-credentials.json'),
        (token, tokenSecret, profile, done) => {
            console.log(profile)
            return done(null, {id: 42, user: 'user'})
    //        User.findOrCreate({ googleId: profile.id }, (err, user) => { return done(err, user); });
        }
    ))

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: 'openid profile email',
            prompt: 'select_account'
        })
    )

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        (req, res) => { res.redirect('/') }
    )

    app.get('/auth/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    passport.serializeUser((user, done) => {
        console.log('save user', user)
        done(null, user.id) // first parameter is the error
    })

    passport.deserializeUser((id, done) => {
        console.log('restore user id', id)
        return done(null, {id: id, user: 'user'})
    //    User.findById(id, (err, user) => { done(err, user); });
    })
}

module.exports = do_auth
