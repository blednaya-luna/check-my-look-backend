import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface AuthToken {
    accessToken: string;
    kind: string;
}

type comparePasswordFunction = (candidatePassword: string, cb: (err: Error, isMatch: boolean) => void) => void;

export type UserDocument = mongoose.Document & {
    email: string;
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;
    emailVerificationToken: string;
    emailVerified: boolean;

    tokens: AuthToken[];
    facebook: string;
    twitter: string;
    instagram: string;

    profile: {
        name: string;
        gender: string;
        location: string;
        website: string;
        picture: string;
    };

    comparePassword: comparePasswordFunction;
};

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerified: Boolean,

    tokens: Array,
    facebook: String,
    twitter: String,
    instagram: String,

    profile: {
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String,
    },
}, {
    timestamps: true,
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this as UserDocument;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

userSchema.methods.comparePassword = comparePassword;

// userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
//     bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
//         cb(err, isMatch);
//     });
// };

export const User = mongoose.model<UserDocument>('User', userSchema);
