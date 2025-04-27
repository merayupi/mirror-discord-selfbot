import { WebhookClient } from 'discord.js-selfbot-v13';
import { getWebhook } from '../config/database.js';
import { createEmbedMessage, createEmbedMessageWithEmbed } from './embedHandler.js';
import logger from '../utils/logger.js';

const processedMessages = new Set();

export default function setupMessageHandlers(client) {
    client.on('messageCreate', async (message) => {
        try {
            if (message.interaction && message.interaction.type === 'APPLICATION_COMMAND') return;

            const webhookUrl = await getWebhook(message.channel.id);
            if (!webhookUrl) return;

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
