import Eris from "eris";
import * as NewsCore from "../Core";

export const config: NewsCore.CommandConfig = {
    name: "hot",
    aliases: ["latest", "headlines"],
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
    if (!News.NewsManager.Bing.lastUpdated)
        return message.channel.createMessage("No headlines were found.");

    let index = args[0] ? parseInt(args[0]) : null;
    if (index) {
        if (isNaN(index))
            return message.channel.createMessage("Invalid News Index.");

        const headline = News.NewsManager.Bing.hot[index - 1];
        if (!headline)
            return message.channel.createMessage(
                "Headline with that index was not found"
            );

        const embed = News.NewsManager.Bing.getEmbed(headline);
        embed.color = NewsCore.Constants.bing.color;
        return message.channel.createMessage({ embed });
    }

    const latest = [...News.NewsManager.Bing.hot];
    let description = "";

    latest.forEach((lat, i) => {
        if (description.length + lat.title.length + lat.url.length < 2000)
            description += `\n\`${i + 1}\` **[${lat.title}](${lat.url})**`;
    });

    const embed: Eris.EmbedOptions = {
        title: "Headlines",
        url: NewsCore.Constants.bing.base,
        color: NewsCore.Constants.bing.color,
        thumbnail: {
            url: NewsCore.Constants.bing.icon
        },
        description: description,
        timestamp: new Date(News.NewsManager.Bing.lastUpdated),
        footer: {
            text: "Last updated at"
        }
    };

    message.channel.createMessage({ embed });
};

export default new NewsCore.Command(config, execute);
