import { MessageAttachment, MessageEmbed } from 'discord.js-selfbot-v13';
import logger from '../utils/logger.js';

export async function createEmbedMessageWithEmbed(message, webhook) {
    try {
        const author = message.author.displayName;
        const pfp = message.author.avatarURL();
        const content = message.content || "\u200B";
        const attachments = [...message.attachments.values()];

        const options = {
            username: author,
            avatarURL: pfp,
            content: content,
        };

        const modifiedEmbeds = message.embeds.map(embed => {
            const modifiedEmbed = { ...embed };

            if (modifiedEmbed.description == null) {
                modifiedEmbed.description = '\u200B';
            }

            if (modifiedEmbed.fields && modifiedEmbed.fields.length > 0) {
                modifiedEmbed.fields = modifiedEmbed.fields.map(field => ({
                    ...field,
                    name: field.name || ' ',
                    value: field.value || ' '
                }));
            }

            if (modifiedEmbed.thumbnail &&
                modifiedEmbed.author?.name?.includes('Replied to')) {
                delete modifiedEmbed.thumbnail;
            }

            if (modifiedEmbed.footer && modifiedEmbed.footer.iconURL) {
                delete modifiedEmbed.footer.iconURL;
            }

            if (modifiedEmbed.footer && modifiedEmbed.footer.text.includes('Token Scanners & Aggregators by Alphub')) {
                delete modifiedEmbed.footer;
            }
            return modifiedEmbed;
        });

        options.embeds = modifiedEmbeds;

        // Only include valid attachments
        if (attachments.length > 0) {
            try {
                // Use simple object format instead of MessageAttachment
                options.files = attachments.map(attachment => ({
                    attachment: attachment.proxyURL || attachment.url, // Try proxy URL first
                    name: attachment.name || 'attachment.png'
                }));

                logger.info(`Attempting to send message with embeds and ${attachments.length} attachments`);
            } catch (attachError) {
                logger.error(`Error processing attachments for embed message: ${attachError}`);
                // If attachments fail, still try to send the message without them
            }
        }

        await webhook.send(options);
        logger.info(`Successfully sent message with embeds to ${message.channel.name}`);
    } catch (error) {
        logger.error(`Error sending webhook message withembed [${message.channel.name}]:`, error);
        if (message.attachments.size > 0) {
            const attachmentDetails = [...message.attachments.values()].map(a => ({
                url: a.url,
                proxyURL: a.proxyURL,
                contentType: a.contentType,
                name: a.name,
                size: a.size
            }));
            logger.error(`Attachment details: ${JSON.stringify(attachmentDetails)}`);

            // Try again without attachments as fallback
            try {
                const fallbackOptions = {
                    username: author,
                    avatarURL: pfp,
                    content: content + "\n[⚠️ Attachments could not be forwarded]",
                    embeds: options.embeds
                };
                await webhook.send(fallbackOptions);
                logger.info(`Sent fallback message with embeds but without attachments for ${message.channel.name}`);
            } catch (fallbackError) {
                logger.error(`Even fallback send with embeds failed: ${fallbackError}`);
            }
        }
    }
}

export async function createEmbedMessage(message, webhook) {
    try {
        const author = message.author.displayName.replace(' | Alphub Mirrors', '').trim();
        const pfp = message.author.avatarURL();
        const content = message.content || "\u200B";
        const attachments = [...message.attachments.values()];

        const options = {
            username: author,
            avatarURL: pfp,
            content: content,
        };

        // Only include valid attachments
        if (attachments.length > 0) {
            try {
                // Use simple object format instead of MessageAttachment
                options.files = attachments.map(attachment => ({
                    attachment: attachment.proxyURL || attachment.url, // Try proxy URL first
                    name: attachment.name || 'attachment.png'
                }));

                logger.info(`Attempting to send message with ${attachments.length} attachments`);
            } catch (attachError) {
                logger.error(`Error processing attachments: ${attachError}`);
                // If attachments fail, still try to send the message without them
            }
        }

        await webhook.send(options);
        logger.info(`Successfully sent message to ${message.channel.name}`);
    } catch (error) {
        logger.error(`Error sending webhook message default [${message.channel.name}]: `, error);
        if (message.attachments.size > 0) {
            const attachmentDetails = [...message.attachments.values()].map(a => ({
                url: a.url,
                proxyURL: a.proxyURL,
                contentType: a.contentType,
                name: a.name,
                size: a.size
            }));
            logger.error(`Attachment details: ${JSON.stringify(attachmentDetails)}`);

            // Try again without attachments as fallback
            try {
                const fallbackOptions = {
                    username: author,
                    avatarURL: pfp,
                    content: content + "\n[⚠️ Attachments could not be forwarded]"
                };
                await webhook.send(fallbackOptions);
                logger.info(`Sent fallback message without attachments for ${message.channel.name}`);
            } catch (fallbackError) {
                logger.error(`Even fallback send failed: ${fallbackError}`);
            }
        }
    }
}
