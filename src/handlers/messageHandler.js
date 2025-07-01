import { WebhookClient } from 'discord.js-selfbot-v13';
import { getWebhook, adddMessage } from '../config/database.js';
import { createEmbedMessage, createEmbedMessageWithEmbed } from './embedHandler.js';
import logger from '../utils/logger.js';

const processedMessages = new Set();

/**
 * Extracts comprehensive token information from a specific Discord message embed.
 * @param {object} message - The Discord.js message object.
 * @returns {object|null} An object with the token data or null if the embed is not found.
 */
function extractTokenData(message) {
    if (!message?.embeds?.[0]) {
        return null;
    }

    const embed = message.embeds[0];
    const content = message.content ?? '';
    const token_address = content.split('CA: ')[1]?.split(' ')[0] ?? null;

    const isSolana = token_address && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(token_address);
    if (!isSolana) {
        return null;
    }

    const getFieldValue = (fieldName) => embed.fields?.find(f => f.name.includes(fieldName))?.value ?? '';

    // --- Start Extraction ---
    const createdField = getFieldValue('Created');
    const marketStatsField = getFieldValue('Market Stats');
    const holdersField = getFieldValue('Holders');
    const safetyField = getFieldValue('Safety');
    const creatorField = getFieldValue('Creator');
    const rawMentionsGroup = embed.description?.split('→ **GROUP** ')[1] ?? null;
    const dateObj = new Date(parseInt(createdField.match(/<t:(\d+):R>/)?.[1]) * 1000);
    const mentionsField = embed.fields?.find(f => f.name.includes('Last Mentions'))?.name ?? '';
    // Regex matches with optional chaining to prevent errors
    const walletTypes = holdersField.match(/🧠 `(\d+)` • 🌱 `(\d+)` • 🎯 `(\d+)` • 🐋 `(\d+)` • 📦 `(\d+)`/);
    const launchStats = creatorField.match(/Launched `(\d+)` • Migrated `(\d+)` • Failed `(\d+)`/);

    // Build the final object
    const tokenData = {
        token_name: embed.title?.split('(')[0].replace(/<:[^:]+:\d+>/g, '').trim() ?? null,
        token_address: content.split('CA: ')[1] ?? null,
        group_mention: rawMentionsGroup?.match(/<:([a-zA-Z0-9_]+):\d+>/)?.[1] ?? null,
        created_at: toSQLDatetime(dateObj),
        twitter_url: createdField.match(/\(https:\/\/x\.com\/[^\)]+\)/)?.[0].slice(1, -1) ?? null,
        website_url: createdField.match(/\(https:\/\/[^\)]+\)/)?.[0].slice(1, -1) ?? null,
        is_dexpaid: createdField.includes('DEX Paid` • `✅`'),
        market_cap: marketStatsField.match(/MC `\$([^`]+)`/)?.[1] ?? null,
        liquidity: marketStatsField.match(/Liq `\$([^`]+)`/)?.[1] ?? null,
        holders_total: parseInt(holdersField.match(/Total `(\d+)`/)?.[1] ?? '0', 10),
        holders_top10_percent: parseFloat(holdersField.match(/Top10 `([\d\.]+)%/)?.[1] ?? '0.0'),
        smart_wallet: walletTypes ? parseInt(walletTypes[1], 10) : 0,
        new_wallet: walletTypes ? parseInt(walletTypes[2], 10) : 0,
        sniper_wallet: walletTypes ? parseInt(walletTypes[3], 10) : 0,
        whale_wallet: walletTypes ? parseInt(walletTypes[4], 10) : 0,
        bundle: parseFloat(safetyField.match(/Bundles `([\d\.]+)%/)?.[1] ?? '0.0'),
        creator_wallet_url: creatorField.match(/\(https:\/\/solscan\.io\/[^\)]+\)/)?.[0].slice(1, -1) ?? null,
        creator_wallet_hold_percent: parseFloat(creatorField.match(/Holds `([\d\.]+)%/)?.[1] ?? '0.0'),
        creator_wallet_balance_sol: parseFloat(creatorField.match(/Balance `([\d\.]+) SOL`/)?.[1] ?? null),
        creator_sold: creatorField.includes('Sold'),
        launches: launchStats ? parseInt(launchStats[1], 10) : 0,
        migrated: launchStats ? parseInt(launchStats[2], 10) : 0,
        failed: launchStats ? parseInt(launchStats[3], 10) : 0,
        bonding_percent: parseFloat(creatorField.match(/Bonding .* (\d+)%/)?.[1] ?? '0.0'),
        total_mentions: parseInt(mentionsField.match(/\(Total: (\d+)\)/)?.[1] ?? '0', 10),
    };

    return tokenData;
}

function toSQLDatetime(date) {
  const pad = n => n.toString().padStart(2, '0');
  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

export default function setupMessageHandlers(client) {
    client.on('messageCreate', async (message) => {
        try {
            if (message.interaction && message.interaction.type === 'APPLICATION_COMMAND') return;

            const webhookUrl = await getWebhook(message.channel.id);
            if (!webhookUrl) return;
            if (message.channel.id == '1320522305042124811') {
                const tokenData = extractTokenData(message);
                if(tokenData){
                    adddMessage(
                        tokenData.token_name, tokenData.token_address, tokenData.group_mention,
                        tokenData.created_at, tokenData.twitter_url, tokenData.website_url, tokenData.is_dexpaid, tokenData.market_cap,
                        tokenData.liquidity, tokenData.holders_total, tokenData.holders_top10_percent, tokenData.smart_wallet,
                        tokenData.new_wallet, tokenData.sniper_wallet, tokenData.whale_wallet, tokenData.bundle,
                        tokenData.creator_wallet_url, tokenData.creator_wallet_hold_percent, tokenData.creator_wallet_balance_sol,
                        tokenData.creator_sold, tokenData.launches, tokenData.migrated, tokenData.failed,
                        tokenData.bonding_percent, tokenData.total_mentions)
                }
            }
            const webhook = new WebhookClient({ url: webhookUrl });

            if (message.embeds.length <= 0) {
                await createEmbedMessage(message, webhook);
            } else {
                await createEmbedMessageWithEmbed(message, webhook);
            }
        } catch (error) {
            logger.error('Error processing message:', error);
        }
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        try {
            if (newMessage.author.bot && newMessage.interaction) {
                if (processedMessages.has(newMessage.id)) return;

                const webhookUrl = await getWebhook(newMessage.channel.id);
                if (!webhookUrl) return;

                const webhook = new WebhookClient({ url: webhookUrl });

                if (newMessage.embeds.length <= 0) {
                    await createEmbedMessage(newMessage, webhook);
                } else {
                    await createEmbedMessageWithEmbed(newMessage, webhook);
                }

                processedMessages.add(newMessage.id);
            }
        } catch (error) {
            logger.error('Error processing updated message:', error);
        }
    });
}
