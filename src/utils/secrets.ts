import fs from 'fs';
import dotenv from 'dotenv';
import logger from './logger';

if (fs.existsSync('.env')) {
    logger.debug('Using .env file to supply config environment variables');
    dotenv.config({ path: '.env' });
} else {
    logger.debug('Using .env.example file to supply config environment variables');
}

export const ENVIRONMENT = process.env.NODE_ENV;

export const SESSION_SECRET = process.env['SESSION_SECRET'];
if (!SESSION_SECRET) {
    logger.error('No client secret. Set SESSION_SECRET environment variable.');
    process.exit(1);
}

export const MONGODB_URI = ENVIRONMENT === 'production' ? process.env['MONGODB_URI'] : process.env['MONGODB_URI_LOCAL'];
if (!MONGODB_URI) {
    if (ENVIRONMENT === 'production') {
        logger.error('No mongo connection string. Set MONGODB_URI environment variable.');
    } else {
        logger.error('No mongo connection string. Set MONGODB_URI_LOCAL environment variable.');
    }
    process.exit(1);
}
