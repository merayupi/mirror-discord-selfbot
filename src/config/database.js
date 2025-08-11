import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Use either DATABASE_URL, MONGODB_URI, or database_url from env; default to local
const MONGODB_URI = process.env.DATABASE_URL;

// Schemas
const ChannelSchema = new mongoose.Schema(
    {
        channel_id: { type: String, required: true, unique: true },
        channel_name: { type: String, required: true },
        webhook_url: { type: String, required: true },
    },
    { collection: 'channels', timestamps: true }
);

const MessageSchema = new mongoose.Schema(
    {
        token_name: { type: String, required: true },
        token_address: { type: String, required: true },
        group_mention: { type: String, required: true },
        created_at: { type: String }, // keep as string to match existing usage
        twitter_url: { type: String, default: null },
        website_url: { type: String, default: null },
        is_dexpaid: { type: Boolean, default: false },
        market_cap: { type: String, default: null },
        liquidity: { type: String, default: null },
        holders_total: { type: Number, default: 0 },
        holders_top10_percent: { type: Number, default: 0.0 },
        smart_wallet: { type: Number, default: 0 },
        new_wallet: { type: Number, default: 0 },
        sniper_wallet: { type: Number, default: 0 },
        whale_wallet: { type: Number, default: 0 },
        bundle: { type: Number, default: 0 },
        creator_wallet_url: { type: String, default: null },
        creator_wallet_hold_percent: { type: Number, default: 0.0 },
        creator_wallet_balance_sol: { type: Number, default: null },
        creator_sold: { type: Boolean, default: false },
        launches: { type: Number, default: 0 },
        migrated: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        bonding_percent: { type: Number, default: 0.0 },
        total_mentions: { type: Number, default: 0 },
    },
    { collection: 'messages', timestamps: true }
);

let ChannelModel;
let MessageModel;

export async function initializeDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        ChannelModel = mongoose.models.Channel || mongoose.model('Channel', ChannelSchema);
        MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

        await ChannelModel.syncIndexes?.();
        logger.info('MongoDB connected and indexes ensured');
    } catch (err) {
        logger.error('Error initializing MongoDB:', err);
    }
}

export async function addMessage(
    token_name,
    token_address,
    group_mention,
    created_at,
    twitter_url = null,
    website_url = null,
    is_dexpaid = false,
    market_cap = null,
    liquidity = null,
    holders_total = 0,
    holders_top10_percent = 0.0,
    smart_wallet = 0,
    new_wallet = 0,
    sniper_wallet = 0,
    whale_wallet = 0,
    bundle = 0,
    creator_wallet_url = null,
    creator_wallet_hold_percent = 0.0,
    creator_wallet_balance_sol = null,
    creator_sold = false,
    launches = 0,
    migrated = 0,
    failed = 0,
    bonding_percent = 0.0,
    total_mentions = 0
) {
    try {
        if (!MessageModel) {
            // In case initializeDatabase was not called for some reason
            await initializeDatabase();
        }
        const doc = new MessageModel({
            token_name,
            token_address,
            group_mention,
            created_at,
            twitter_url,
            website_url,
            is_dexpaid,
            market_cap,
            liquidity,
            holders_total,
            holders_top10_percent,
            smart_wallet,
            new_wallet,
            sniper_wallet,
            whale_wallet,
            bundle,
            creator_wallet_url,
            creator_wallet_hold_percent,
            creator_wallet_balance_sol,
            creator_sold,
            launches,
            migrated,
            failed,
            bonding_percent,
            total_mentions,
        });
        await doc.save();
    } catch (err) {
        logger.error('Error adding message to MongoDB:', err);
        throw err;
    }
}

export async function getWebhook(channelId) {
    try {
        if (!ChannelModel) {
            await initializeDatabase();
        }
        const channel = await ChannelModel.findOne({ channel_id: channelId }).lean();
        return channel ? channel.webhook_url : null;
    } catch (err) {
        logger.error('Error getting webhook from MongoDB:', err);
        return null;
    }
}
