// @ts-ignore // FIXME
import { Strategy } from 'passport-instagram';

import { User } from '../../models/User';

export const instagramStrategy = new Strategy({
    clientID: process.env.INSTAGRAM_ID,
    clientSecret: process.env.INSTAGRAM_SECRET,
    callbackURL: '/auth/instagram/callback',
    passReqToCallback: true
    // @ts-ignore // FIXME
}, (req, accessToken, refreshToken, profile, done) => {
    if (req.user) {
        User.findOne({ instagram: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                // 'errors', 'There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
                done(err);
            } else {
                User.findById(req.user.id, (err, user) => {
                    if (err) { return done(err); }
                    user.instagram = profile.id;
                    user.tokens.push({ kind: 'instagram', accessToken });
                    user.profile.name = user.profile.name || profile.displayName;
                    user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
                    user.profile.website = user.profile.website || profile._json.data.website;
                    user.save((err) => {
                        // 'info', 'Instagram account has been linked.'
                        done(err, user);
                    });
                });
            }
        });
    } else {
        User.findOne({ instagram: profile.id }, (err, existingUser) => {
            if (err) { return done(err); }
            if (existingUser) {
                return done(null, existingUser);
            }
            const user = new User();
            user.instagram = profile.id;
            user.tokens.push({ kind: 'instagram', accessToken });
            user.profile.name = profile.displayName;
            // Similar to Twitter API, assigns a temporary e-mail address
            // to get on with the registration process. It can be changed later
            // to a valid e-mail address in Profile Management.
            user.email = `${profile.username}@instagram.com`;
            user.profile.website = profile._json.data.website;
            user.profile.picture = profile._json.data.profile_picture;
            user.save((err) => {
                done(err, user);
            });
        });
    }
});
