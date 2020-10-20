import * as NewsCore from "../Core";
import Eris from "eris";
import dayjs from "dayjs";

export const config: NewsCore.CommandConfig = {
    name: "dated",
    aliases: ["date"],
    description: "Ping Pong!",
    usage: "<YYYY-MM-DD|date>",
    example: ["2020-10-20"],
    category: "News",
    available: "Any"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    if (!args[0])
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Mention a Date to retrieve News",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });

    const date = dayjs(args[0]).format("YYYY-MM-DD");
    if (date === "Invalid Date")
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Invalid Date was provided",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });

    const news = await News.Database.News.findAll({
        where: {
            date: date
        },
        limit: 10
    });

    if (!news.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "No News were found for the provided Date",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });

    let description = "";

    news.forEach((n, i) => {
        let title = n.getDataValue("title"),
            url = n.getDataValue("url");
        if (description.length + title.length + url.length < 2000)
            description += `\n\`${i + 1}\` **[${title}](${url})**`;
    });

    const embed: Eris.EmbedOptions = {
        title: "Headlines",
        url: NewsCore.Constants.bing.base,
        color: NewsCore.Constants.bing.color,
        thumbnail: {
            url: NewsCore.Constants.bing.icon
        },
        description: description,
        timestamp: date,
        footer: {
            text: "News of"
        }
    };

    message.channel.createMessage({ embed });
};

export default new NewsCore.Command(config, execute);
