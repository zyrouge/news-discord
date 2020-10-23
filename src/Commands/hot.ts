import Eris from "eris";
import * as NewsCore from "../Core";

export const config: NewsCore.CommandConfig = {
    name: "hot",
    aliases: ["news", "latest", "headlines"],
    description: "Latest News",
    usage: "[number]",
    example: ["", "3"],
    category: "News",
    available: "Any"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    if (
        !News.NewsManager.Bing.lastUpdated ||
        !News.NewsManager.Bing.hot.length ||
        !News.NewsManager.Bing.embeds.length
    )
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "No headlines were found.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            } as Eris.EmbedOptions
        });

    let index = args[0] !== undefined ? parseInt(args[0]) : null;
    if (index) {
        if (isNaN(index))
            return message.channel.createMessage({
                embed: {
                    author: {
                        name: "Invalid News Index.",
                        icon_url: NewsCore.Utils.Emojis.cross.url
                    },
                    color: NewsCore.Utils.Colors.red.num
                } as Eris.EmbedOptions
            });

        const headline = News.NewsManager.Bing.hot[index - 1];
        if (!headline)
            return message.channel.createMessage({
                embed: {
                    author: {
                        name: "Headline with that index was not found.",
                        icon_url: NewsCore.Utils.Emojis.cross.url
                    },
                    color: NewsCore.Utils.Colors.red.num
                } as Eris.EmbedOptions
            });

        const embed = News.NewsManager.Bing.getEmbed(headline);
        embed.color = NewsCore.Constants.bing.color;
        return message.channel.createMessage({ embed });
    }

    const headlines = News.NewsManager.Bing.embeds;
    let current = 0;
    const arrows = { left: "⬅️", right: "➡️" };
    const emjAr = Object.values(arrows);

    const msg = await message.channel.createMessage({
        embed: getEmbed(headlines[current])
    });

    if (headlines.length > 1) {
        emjAr.forEach((e) => msg.addReaction(e).catch(() => {}));

        const reactor = new NewsCore.Utils.ReactionHandler(
            News.bot,
            msg,
            (userID) => userID === message.author.id,
            false,
            { maxMatches: 10, time: 1 * 60 * 1000 }
        );

        reactor.on("reacted", (reaction) => {
            if (emjAr.includes(reaction.emoji.name)) {
                if (reaction.emoji.name === arrows.left) {
                    if (headlines[current - 1]) current -= 1;
                    else current = headlines.length - 1;
                } else if (reaction.emoji.name === arrows.right) {
                    if (headlines[current + 1]) current += 1;
                    else current = 0;
                }
                msg.edit({ embed: getEmbed(headlines[current]) });
                msg.removeReaction(
                    reaction.emoji.name,
                    message.author.id
                ).catch(() => {});
            }
        });

        reactor.on("end", () => {
            msg.removeReactions().catch(() => {});
        });
    }

    function getEmbed(description: string) {
        const embed: Eris.EmbedOptions = {
            title: `${NewsCore.Utils.Emojis.fire} Recent Headlines`,
            url: NewsCore.Constants.bing.base,
            color: NewsCore.Constants.bing.color,
            thumbnail: {
                url: NewsCore.Constants.bing.icon
            },
            description: description,
            timestamp: News.NewsManager.Bing.lastUpdated
                ? new Date(News.NewsManager.Bing.lastUpdated)
                : undefined,
            footer: {
                text: `Page #${current + 1} of ${
                    News.NewsManager.Bing.embeds.length
                } • Last updated at`
            }
        };
        return embed;
    }
};

export default new NewsCore.Command(config, execute);
