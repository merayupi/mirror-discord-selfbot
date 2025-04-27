import 'dotenv/config';
import { Client as SelfbotClient } from 'discord.js-selfbot-v13';
import { initializeDatabase } from './config/database.js';
import setupMessageHandlers from './handlers/messageHandler.js';
import setupErrorHandlers  from './handlers/errorHandler.js';
import logger from './utils/logger.js';

const selfbot = new SelfbotClient({
    checkUpdate: false
});

setupErrorHandlers(selfbot);

selfbot.once('ready', async () => {
    logger.info(`Selfbot ${selfbot.user.username} is online`);
    selfbot.user.setStatus('available');
});

initializeDatabase();

setupMessageHandlers(selfbot);

selfbot.login(process.env.TOKEN).catch(err => {
    logger.error('Error logging in selfbot:', err);
});
