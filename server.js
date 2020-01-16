const express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const compression = require('compression');
const next = require('next');
var session = require('cookie-session');

//passport stuff
const passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 7000;

const LOGIN_PAGE_URL = "/login";

const authenticationMiddleware = (req, res, next) => {

    if (req.isAuthenticated()) {
      return next()
    }

    res.redirect(LOGIN_PAGE_URL);
}

app
  .prepare()
  .then(() => {

  const server = express();
    server.use(helmet());
    server.use(compression());
    server.use(logger('dev'));
    server.use(cookieParser());

      // initialize express-session to allow us track the logged-in user across sessions.
    var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    server.use(session({
      name: 'grassroots-web-08255', //cookie name
      keys: ['curriculum', 'web08255'], //used to sign and verify cookie
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      cookie: {
        httpOnly: true,
        expires: expiryDate
      }
    }))

    server.use(bodyParser.urlencoded({ extended: false }));
    server.use(bodyParser.json());

    server.use(passport.initialize());
    server.use(passport.session());

    passport.use(new LocalStrategy(function(username, password, done) {

      if (username !="admin") {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (password != "1234") {
        return done(null, false, { message: 'Incorrect password.' });
      }

      let user = {
        token: "UsertokenUsertokenUsertokenUsertokenUsertoken",
        codename: "1211212112121121211212112"
      };

      return done(null, user);

    }));

    passport.serializeUser(function (user, done) {
        done(null, user.token + "--magic08255--" + user.codename);
    });
  
    passport.deserializeUser(function (id, done) {
        
        let userAuth = id.split("--magic08255--");

        let user = {
          token: userAuth[0],
          codename: userAuth[1]
        };

        done(null, user)
    });

    server.post('/login', passport.authenticate('local'), function(req, res) {
      res.redirect('/');
    });

  server.get("/protected", authenticationMiddleware, (req, res) => {
        const actualPage = '/protected';
		const queryParams = {};
		app.render(req, res, actualPage, queryParams);
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

    server.listen(port);
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

  