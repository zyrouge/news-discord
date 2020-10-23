import Eris from "eris";
import * as NewsCore from "../Core";

export const config: NewsCore.CommandConfig = {
    name: "bing",
    aliases: ["bsearch", "bs", "search"],
    description: "Search News on Bing",
    usage: "[search-terms]",
    example: ["discord"],
    category: "News",
    available: "Any"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    const startTime = Date.now();
    const terms = args.join(" ");
    if (!terms.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Provide some terms to search for news!",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            } as Eris.EmbedOptions
        });

    const msg = await message.channel.createMessage(
        `Fetching results for \`${terms}\`...`
    );

    const articles = await News.NewsManager.Bing.search(terms);
    if (!articles.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: `No results were found for \`${terms}\`!`,
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            } as Eris.EmbedOptions
        });

    const embed: Eris.EmbedOptions = {
        title: `Results for ${terms}...`,
        url: NewsCore.Constants.bing.base,
        color: NewsCore.Constants.bing.color,
        thumbnail: {
            url: NewsCore.Constants.bing.icon
        },
        fields: articles.map((n, i) => ({
            name: `\`${i + 1}\` ${n.title}`.shorten(250),
            value: `${n.description ? n.description + " " : ""}**[Read More](${
                n.url
            })**`
        })),
        timestamp: new Date(),
        footer: {
            text: `Results in ${Date.now() - startTime}ms • Requested by ${
                message.author.username
            }#${message.author.discriminator}`
        }
    };
    msg.edit({ content: "", embed });
};

export default new NewsCore.Command(config, execute);
