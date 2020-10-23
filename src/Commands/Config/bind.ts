import * as NewsCore from "../../Core";
import Eris from "eris";

export const config: NewsCore.CommandConfig = {
    name: "bind",
    aliases: ["bound"],
    description: "Bind News Bot to a Channel!",
    usage: "[#channel|channel_id]",
    example: ["#news", "594543235607822367"],
    category: "Configuration",
    available: "Guild"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args, guild, guildDB }: NewsCore.CommandArguments
) => {
    if (!guild || !guildDB)
        return message.channel.createMessage({
            embed: {
                author: {
                    name:
                        "Guild does not exist in cache. Please report this issue in our Discord Server!",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            } as Eris.EmbedOptions
        });

    const arg1 = args[0];
    if (!arg1)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "No Channel ID or Mention was provided.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            } as Eris.EmbedOptions
        });

    if (NewsCore.Constants.keywords.remove.includes(arg1.toLowerCase())) {
        const ChannelID = !Number.isNaN(arg1)
            ? NewsCore.Utils.MentionsManager.ChannelMention(arg1)
            : arg1;
        const MChannel = ChannelID ? guild.channels.get(ChannelID) : undefined;

        if (!MChannel)
            return message.channel.createMessage({
                embed: {
                    author: {
                        name: "Invalid Channel ID or Mention was provided.",
                        icon_url: NewsCore.Utils.Emojis.cross.url
                    },
                    color: NewsCore.Utils.Colors.red.num
                } as Eris.EmbedOptions
            });

        await guildDB.update({
            bindToChannel: MChannel.id
        });

        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Invalid Channel ID or Mention was provided.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                description: `**${News.bot.user.username}** has been bound to ${MChannel.mention}`,
                color: NewsCore.Utils.Colors.red.num
            } as Eris.EmbedOptions
        });
    } else {
        await guildDB.update({
            bindToChannel: undefined
        });

        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Invalid Channel ID or Mention was provided.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                description: `**${News.bot.user.username}** has been bound to **None**`,
                color: NewsCore.Utils.Colors.red.num
            } as Eris.EmbedOptions
        });
    }
};

export default new NewsCore.Command(config, execute);
