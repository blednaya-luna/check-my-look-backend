import { Request, Response, NextFunction } from 'express';
import { check, sanitize, validationResult } from 'express-validator';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';

import { User, UserDocument } from '../models/User';

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    await check('email', 'Email is not valid')
        .isEmail()
        .run(req);
    await check('password', 'Password cannot be blank')
        .isLength({ min: 1 })
        .run(req);
    await sanitize('email')
        // eslint-disable-next-line @typescript-eslint/camelcase
        .normalizeEmail({ gmail_remove_dots: false })
        .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json(errors);
    }

    passport.authenticate('local', (err: Error, user: UserDocument, info: IVerifyOptions) => {
        if (err) { return next(err); }
        if (!user) {
            return res.json(info.message);
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            // 'success', 'Success! You are logged in.'
            res.redirect(req.session.returnTo || '/');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const getLogout = (req: Request, res: Response) => {
    req.logout();
    res.redirect('/');
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction) => {
    await check('email', 'Email is not valid').isEmail().run(req);
    await check('password', 'Password must be at least 4 characters long').isLength({ min: 4 }).run(req);
    await check('confirmPassword', 'Passwords do not match').equals(req.body.password).run(req);
    // eslint-disable-next-line @typescript-eslint/camelcase
    await sanitize('email').normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json(errors);
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            // 'errors', 'Account with that email address already exists.'
            return res.redirect('/signup');
        }
        user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
};
