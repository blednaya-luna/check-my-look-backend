import express from 'express';
import session from 'express-session';
import flash from 'express-flash';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';
import bluebird from 'bluebird';
import compression from 'compression';
import bodyParser from 'body-parser';
import passport from 'passport';
import lusca from 'lusca';
import path from 'path';

import { MONGODB_URI, SESSION_SECRET } from './utils/secrets';

/**
 * Controllers (route handlers)
 */
import * as userController from './controllers/user';

const MongoStore = connectMongo(session);

/**
 * Create Express server
 */
const app = express();

/**
 * Connect to MongoDB
 */
mongoose.Promise = bluebird;
mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .catch((err) => console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err));

/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: MONGODB_URI,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

/**
 * Primary app routes.
 */
app.post('/login', userController.postLogin);
app.get('/logout', userController.getLogout);
app.post('/signup', userController.postSignup);
// app.post('/forgot', userController.postForgot); // TODO
// app.post('/reset/:token', userController.postReset); // TODO


/**
 * OAuth authentication routes. (Sign in)
 */
// TODO

export default app;
