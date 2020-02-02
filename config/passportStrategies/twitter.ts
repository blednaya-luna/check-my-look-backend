import { Strategy } from 'passport-twitter';

import { User } from '../../models/User';

export const twitterStrategy = new Strategy({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
    passReqToCallback: true
}, (req, accessToken, tokenSecret, profile, done) => {
    if (req.user) {
        User.findOne({ twitter: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                // 'errors', 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
                done(err);
            } else {
                // @ts-ignore // FIXME
                User.findById(req.user.id, (err, user) => {
                    if (err) { return done(err); }
                    user.twitter = profile.id;
                    // @ts-ignore // FIXME
                    user.tokens.push({ kind: 'twitter', accessToken, tokenSecret });
                    user.profile.name = user.profile.name || profile.displayName;
                    user.profile.location = user.profile.location || profile._json.location;
                    user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
                    user.save((err) => {
                        if (err) { return done(err); }
                        // 'info', 'Twitter account has been linked.'
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({ twitter: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                return done(null, existingUser);
            }
            const user = new User();
            // Twitter will not provide an email address.  Period.
            // But a person’s twitter username is guaranteed to be unique
            // so we can "fake" a twitter email address as follows:
            user.email = `${profile.username}@twitter.com`;
            user.twitter = profile.id;
            // @ts-ignore // FIXME
            user.tokens.push({ kind: 'twitter', accessToken, tokenSecret });
            user.profile.name = profile.displayName;
            user.profile.location = profile._json.location;
            user.profile.picture = profile._json.profile_image_url_https;
            user.save((err) => {
                done(err, user);
            });
        });
    }
});
