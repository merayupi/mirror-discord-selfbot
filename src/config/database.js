import mysql from 'mysql2/promise';
import logger from '../utils/logger.js';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "12345678",
    database: 'db_discord',
});


export function initializeDatabase() {
    connection.query(`CREATE TABLE IF NOT EXISTS channels (
        channel_id VARCHAR(255) PRIMARY KEY,
        channel_name VARCHAR(255) NOT NULL,
        webhook_url VARCHAR(255) NOT NULL
    )`)
    .then(() => {
        logger.info('Database initialized successfully');
    })
    .catch(err => {
        logger.error('Error initializing database:', err);
    });
}

export async function getWebhook(channelId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT webhook_url FROM channels WHERE channel_id = ?', [channelId])
            .then(([rows]) => {
                resolve(rows.length > 0 ? rows[0].webhook_url : null);
            })
            .catch(err => {
                logger.error('Error get webhook from database:', err);
            });
    });
}
