import mysql from 'mysql2/promise';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection({
    host: 'localhost',
    user: process.env.user,
    password: process.env.password || '',
    database: 'db_discord',
});

export function initializeDatabase() {
    connection.query(`CREATE TABLE IF NOT EXISTS channels (
        channel_id VARCHAR(255) PRIMARY KEY,
        channel_name VARCHAR(255) NOT NULL,
        webhook_url VARCHAR(255) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        token_name VARCHAR(255) NOT NULL,
        token_address VARCHAR(255) NOT NULL,
        group_mention VARCHAR(255) NOT NULL,
        created_at DATETIME,
        twitter_url VARCHAR(255),
        website_url VARCHAR(255),
        is_dexpaid BOOLEAN NOT NULL DEFAULT false,
        market_cap VARCHAR(50),
        liquidity VARCHAR(50),
        holders_total INT,
        holders_top10_percent DECIMAL(5,2),
        smart_wallet INT,
        new_wallet INT,
        sniper_wallet INT,
        whale_wallet INT,
        bundle INT,
        creator_wallet_url VARCHAR(255),
        creator_wallet_hold_percent DECIMAL(5,2),
        creator_wallet_balance_sol VARCHAR(50),
        creator_sold BOOLEAN,
        launches INT,
        migrated INT,
        failed INT,
        bonding_percent DECIMAL(5,2),
        total_mentions INT,
    );
    `)
        .then(() => {
            logger.info('Database initialized successfully');
        })
        .catch(err => {
            logger.error('Error initializing database:', err);
        });
}

export function adddMessage(token_name, token_address, group_mention, created_at, twitter_url = null, website_url = null, is_dexpaid = false, market_cap = null, liquidity = null, holders_total = 0, holders_top10_percent = 0.0, smart_wallet = 0, new_wallet = 0, sniper_wallet = 0, whale_wallet = 0, bundle = 0, creator_wallet_url = null, creator_wallet_hold_percent = 0.0, creator_wallet_balance_sol = null, creator_sold = false, launches = 0, migrated = 0, failed = 0, bonding_percent = 0.0, total_mentions = 0) {
    return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO messages values (${token_name}, ${token_address}, ${group_mention}, ${created_at}, ${twitter_url}, ${website_url}, ${is_dexpaid}, ${market_cap}, ${liquidity}, ${holders_total}, ${holders_top10_percent}, ${smart_wallet}, ${new_wallet}, ${sniper_wallet}, ${whale_wallet}, ${bundle}, ${creator_wallet_url}, ${creator_wallet_hold_percent}, ${creator_wallet_balance_sol}, ${creator_sold}, ${launches}, ${migrated}, ${failed}, ${bonding_percent}, ${total_mentions})`)
            .then(() => {
                resolve();
            })
            .catch(err => {
                logger.error('Error adding message to database:', err);
                reject(err);
            });
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
