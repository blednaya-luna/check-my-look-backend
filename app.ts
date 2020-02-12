/**
 * Module dependencies.
 */
import express, { Request, Response, NextFunction, Errback } from 'express';
import session from 'express-session';
import statusMonitor from 'express-status-monitor';
import passport from 'passport';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import lusca from 'lusca';
import errorHandler from 'errorhandler';
import chalk from 'chalk';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compression from 'compression';
import connectMongo from 'connect-mongo';

// TODO разобраться с этим
const MongoStore = connectMongo(session);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
import * as userController from './controllers/user';

/**
 * API keys and Passport configuration.
 */
// TODO разобратся что не так было с конфигом passport
// import * as passportConfig from './config/passport';
import './config/passport';

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 8080);
app.use(statusMonitor());
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true,
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user
        && req.path !== '/login'
        && req.path !== '/signup'
        && !req.path.match(/^\/auth/)
        && !req.path.match(/\./)) {
        req.session.returnTo = req.originalUrl;
    } else if (req.user
        && (req.path === '/account' || req.path.match(/^\/api/))) {
        req.session.returnTo = req.originalUrl;
    }
    next();
});

/**
 * Primary app routes.
 */
app.post('/login', userController.postLogin);
app.get('/logout', userController.getLogout);
app.post('/signup', userController.postSignup);
// app.post('/forgot', userController.postForgot); // TODO реализовать
// app.post('/reset/:token', userController.postReset); // TODO реализовать
// app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile); // TODO реализовать
// app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword); // TODO реализовать
// app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount); // TODO реализовать

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram', { scope: ['basic', 'public_content'] }));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorHandler());
} else {
    app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
        console.error(err);
        res.status(500).send('Server Error');
    });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => console.log(
    '%s App is running at http://localhost:%d in %s mode',
    chalk.green('✓'),
    app.get('port'),
    app.get('env'),
));

module.exports = app;
