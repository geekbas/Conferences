
const session = require('express-session')
const FirestoreStore = require('firestore-store')(session);
const FileStore = require('session-file-store')(session);

const passport = require('passport')
//    , TwitterStrategy = require('passport-twitter').Strategy
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const path = require('path')
const User = require(path.join(__dirname, 'modules', 'user'))

// TODO: twitter, et al

const do_auth = function(app) {
    app.use(session({
        secret: 'very secret',
        resave: true,
        rolling: true,
        saveUninitialized: true
//        ,store: new FirestoreStore({ database: require(path.join(__dirname, 'modules', 'firestore'))})
        ,store: new FileStore({})
//        ,cookie: {//secure: true -- only if https}
    }))
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new GoogleStrategy(require('./google-credentials.json'),
        (token, tokenSecret, profile, done) => {
            console.log(profile)
            User.findOrCreate(
                { googleId: profile.id },
                {
                    given_name: profile.name.givenName,
                    family_name: profile.name.familyName,
                    email: profile.emails.length > 0 ? profile.emails[0].value : null
                },
                (err, user) => { return done(err, user) })
        }
    ))

    app.get('/auth/google',
        passport.authenticate('google', {
            scope: 'openid profile email',
            prompt: 'select_account'
        })
    )

    app.get('/auth/google/callback',
        passport.authenticate('google',
            { failureRedirect: '/login' }),
        (req, res) => { res.redirect('/') }
    )

    app.get('/auth/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    passport.serializeUser((user, done) => {
        done(null, user.id) // first parameter is the error
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => { done(err, user) })
    })
}

module.exports = do_auth
