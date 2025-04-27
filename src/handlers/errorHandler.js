import logger from '../utils/logger.js';

export default function setupErrorHandlers(client) {
    client.on('error', (err) => {
        logger.error('Selfbot Error:', err);
    });

    process.on('unhandledRejection', err => {
        logger.error('----------------------------------UNHANDLED REJECTION----------------------------------');
        logger.error(err);
        logger.error('--------------------------------------------------------------------------------');
    });

    process.on('uncaughtException', err => {
        logger.error('----------------------------------UNCAUGHT EXCEPTION----------------------------------');
        logger.error(err);
        logger.error('--------------------------------------------------------------------------------');
        process.exit(1);
    });
}
