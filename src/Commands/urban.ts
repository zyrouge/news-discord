import * as NewsCore from "../Core";
import axios from "axios";
import Eris from "eris";

export const config: NewsCore.CommandConfig = {
    name: "urban",
    aliases: ["ur", "dictionary", "dict"],
    description: "Search meanings of unknown words",
    usage: "<word>",
    example: ["celestial"],
    category: "Utils",
    available: "Guild NSFW"
};

interface UrbanDictionary {
    definition: string;
    permalink: string;
    thumbs_up: number;
    sound_urls: string[];
    author: string;
    word: string;
    defid: number;
    written_on: string;
    example: string;
    thumbs_down: number;
}

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    const terms = args.join(" ");
    if (!terms.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Mention a Date to retrieve News",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });

    const response = await axios.get(
        NewsCore.Constants.urban.search + encodeURIComponent(terms)
    );

    const data: { list: UrbanDictionary[] } = response.data;

    if (!data || !data.list || !data.list.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: `No results for ${terms}`,
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });

    let defNum = 0;
    const arrows = { left: "⬅️", right: "➡️" };
    const emjAr = Object.values(arrows);

    const msg = await message.channel.createMessage({
        embed: getEmbed(data.list[defNum])
    });
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
                if (data.list[defNum - 1]) defNum -= 1;
                else defNum = data.list.length - 1;
            } else if (reaction.emoji.name === arrows.right) {
                if (data.list[defNum + 1]) defNum += 1;
                else defNum = 0;
            }
            msg.edit({ embed: getEmbed(data.list[defNum]) });
            msg.removeReaction(
                reaction.emoji.name,
                message.author.id
            ).catch(() => {});
        }
    });

    reactor.on("end", () => {
        msg.removeReactions().catch(() => {});
    });

    function getEmbed(def: UrbanDictionary) {
        const fields: Eris.EmbedField[] = [];

        if (def.definition)
            fields.push({
                name: "Definition",
                value: def.definition.shorten(600)
            });

        if (def.example)
            fields.push({
                name: "Examples",
                value: def.example.shorten(600)
            });

        const embed: Eris.EmbedOptions = {
            title: `Word: ${def.word}`,
            url: def.permalink,
            color: NewsCore.Utils.Colors.blurple.num,
            fields: fields,
            footer: {
                text: `Definition #${defNum + 1} of ${data.list.length} • 👍 ${
                    def.thumbs_up || 0
                } • 👎 ${def.thumbs_down || 0}`
            }
        };

        return embed;
    }
};

export default new NewsCore.Command(config, execute);
