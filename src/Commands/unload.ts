import * as NewsCore from "../Core";

export const config: NewsCore.CommandConfig = {
    name: "unload",
    aliases: ["ul"],
    description: "Unloads a Command",
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

        const cmd = News.commander.resolveCommand(args[0]);
        if (!cmd)
            return message.channel.createMessage(
                `${NewsCore.Utils.Emojis.cross} \`${args[0]}\` command not found.`
            );

        News.commander.unload(cmd.config.name);
        message.channel.createMessage(
            `${NewsCore.Utils.Emojis.tick} Unloaded \`${cmd.config.name}\` command.`
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
