import passport from 'passport';

import { localStrategy } from './passportStrategies/local';
import { instagramStrategy } from './passportStrategies/instagram';
import { facebookStrategy } from './passportStrategies/facebook';
import { twitterStrategy } from './passportStrategies/twitter';
import { User } from '../models/User';

passport.serializeUser((user, done) => {
    // @ts-ignore // FIXME
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

/**
 * Sign in using Email and Password
 */
passport.use(localStrategy);

/**
 * Sign in with Instagram
 */
passport.use(instagramStrategy);

/**
 * Sign in with Facebook
 */
passport.use(facebookStrategy);


/**
 * Sign in with Twitter
 */
passport.use(twitterStrategy);
