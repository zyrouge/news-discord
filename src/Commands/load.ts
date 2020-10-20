import * as NewsCore from "../Core";

export const config: NewsCore.CommandConfig = {
    name: "load",
    aliases: ["ld"],
    description: "Loads a Command",
    usage: "<name>",
    example: ["ping"],
    category: "Developer",
    available: "Any"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    try {
        if (!args[0])
            return message.channel.createMessage(
                `${NewsCore.Utils.Emojis.cross} Specify a command name.`
            );

        News.commander.load(
            args[0].endsWith(".js") ? args[0] : args[0] + ".js"
        );
        message.channel.createMessage(
            `${NewsCore.Utils.Emojis.tick} Loaded \`${args[0]}\` command.`
        );
    } catch (err) {
        message.channel.createMessage({
            embed: {
                color: NewsCore.Utils.Colors.red.num,
                fields: [
                    {
                        name: `${NewsCore.Utils.Emojis.cross} Error`,
                        value: `\`\`\`xl\n${News.Utils.clean(`${err}`).shorten(
                            500,
                            true
                        )}\`\`\``
                    }
                ]
            }
        });
    }
};

export default new NewsCore.Command(config, execute);
