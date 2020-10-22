import * as NewsCore from "../../Core";

export const config: NewsCore.CommandConfig = {
    name: "configuration",
    aliases: ["config", "conf"],
    description: "Configurate settings",
    usage: "",
    example: [""],
    category: "Configuration",
    available: "Guild",
    permissions: {
        user: {
            manageGuild: true
        }
    }
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, guild, guildDB }: NewsCore.CommandArguments
) => {
    if (guild && guildDB) {
        const desc: string[] = [];

        desc.push(
            `**Prefix:** \`${
                guildDB.getDataValue("prefix") || News.options.config.prefix
            }\``
        );

        const bound = guildDB.getDataValue("bindToChannel");
        desc.push(`**Bound Channel:** ${bound ? `<#${bound}>` : "None"}`);

        message.channel.createMessage({
            embed: {
                author: {
                    name: `Configuration of ${guild.name}`,
                    icon_url: guild.iconURL
                },
                description: desc.join("\n"),
                color: NewsCore.Utils.Colors.blurple.num
            }
        });
    } // todo
};

export default new NewsCore.Command(config, execute);
