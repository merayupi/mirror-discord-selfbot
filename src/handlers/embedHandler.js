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

        // Handle attachments (videos, GIFs, images)
        if (attachments.length > 0) {
            options.files = attachments.map(attachment => {
                // Get the correct file extension based on content type
                let extension = 'png';
                if (attachment.contentType) {
                    if (attachment.contentType.includes('video')) {
                        extension = attachment.contentType.split('/')[1] || 'mp4';
                    } else if (attachment.contentType.includes('image')) {
                        if (attachment.contentType.includes('gif')) {
                            extension = 'gif';
                        } else {
                            extension = attachment.contentType.split('/')[1] || 'png';
                        }
                    }
                }

                // Use the original filename if available
                const fileName = attachment.name || `attachment.${extension}`;

                return {
                    attachment: attachment.url,
                    name: fileName
                };
            });
        }

        await webhook.send(options);
        if (attachments.length > 0) {
            logger.info(`Successfully sent message with embeds and ${attachments.length} attachments`);
        }
    } catch (error) {
        logger.error(`Error sending webhook message withembed [${message.channel.name}]:`, error);
        // Log more details about the error
        if (message.attachments.size > 0) {
            logger.error(`Attachment details: ${JSON.stringify([...message.attachments.values()].map(a => ({
                url: a.url,
                contentType: a.contentType,
                name: a.name,
                size: a.size
            })))}`);
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

        if (attachments.length > 0) {
            options.files = attachments.map(attachment => {
                // Get the correct file extension based on content type
                let extension = 'png';
                if (attachment.contentType) {
                    if (attachment.contentType.includes('video')) {
                        extension = attachment.contentType.split('/')[1] || 'mp4';
                    } else if (attachment.contentType.includes('image')) {
                        if (attachment.contentType.includes('gif')) {
                            extension = 'gif';
                        } else {
                            extension = attachment.contentType.split('/')[1] || 'png';
                        }
                    }
                }

                // Use the original filename if available
                const fileName = attachment.name || `attachment.${extension}`;

                return {
                    attachment: attachment.url,
                    name: fileName
                };
            });
        }

        await webhook.send(options);
        logger.info(`Successfully sent message with ${attachments.length} attachments`);
    } catch (error) {
        logger.error(`Error sending webhook message default [${message.channel.name}]: `, error);
        // Log more details about the error
        if (message.attachments.size > 0) {
            logger.error(`Attachment details: ${JSON.stringify([...message.attachments.values()].map(a => ({
                url: a.url,
                contentType: a.contentType,
                name: a.name,
                size: a.size
            })))}`);
        }
    }
}
