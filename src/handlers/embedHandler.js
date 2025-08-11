import { MessageAttachment, MessageEmbed } from 'discord.js-selfbot-v13';
import logger from '../utils/logger.js';

export async function createEmbedMessageWithEmbed(message, webhook) {
    try {
        const author = message.author.displayName;
        const pfp = message.author.avatarURL();
        const content = message.content || "\u200B";

        const options = {
            username: author,
            avatarURL: pfp,
            content: content,
        };

        const modifiedEmbeds = message.embeds.map(embed => {
            const modifiedEmbed = {...embed};

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

            if(modifiedEmbed.footer && modifiedEmbed.footer.text.includes('Token Scanners & Aggregators by Alphub')){
                delete modifiedEmbed.footer;
            }
            return modifiedEmbed;
        });

        options.embeds = modifiedEmbeds

        await webhook.send(options);
    } catch (error) {
        logger.error(`Error sending webhook message withembed [${message.channel.name}]:`, error);
    }
}

export async function createEmbedMessage(message, webhook) {
    try{
        const author = message.author.displayName.replace(' | Alphub Mirrors', '').trim();
        const pfp = message.author.avatarURL();
        const content = message.content || "\u200B";
        const image = message.attachments.first();
        const urlimg = image ? image.url : null;
        const attachment = urlimg ? new MessageAttachment(urlimg) : null;

        const options = {
            username: author,
            avatarURL: pfp,
            content: content,
        };

        if (image) {
            options.files = [attachment];
        }
        await webhook.send(options);
    } catch (error) {
        logger.error(`Error sending webhook message default [${message.channel.name}]: `, error);
    }
}
