import * as NewsCore from "../Core";

export const config: NewsCore.CommandConfig = {
    name: "help",
    aliases: ["h", "commands", "cmds"],
    description: "Help Command!",
    usage: "[command]",
    example: ["", "ping"],
    category: "Misc",
    available: "Any"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    if (args.length) {
        const [cmdOne, ...subs] = args;
        let cmd = News.commander.resolveCommand(cmdOne);
        if (!cmd)
            return message.channel.createMessage(
                `${NewsCore.Utils.Emojis.cross} Couldn\'t find anything for \`${cmdOne}\``
            );

        for (const sub of subs) {
            const resed: NewsCore.Command | undefined = cmd?.resolveSubCommand(
                sub
            );
            if (resed) cmd = resed;
        }

        message.channel.createMessage({ embed: News.commander.getEmbed(cmd) });
    } else {
        message.channel.createMessage("k");
    }
};

export default new NewsCore.Command(config, execute);
