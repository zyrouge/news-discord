import Eris from "eris";
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
        const categories: { [s: string]: string[] } = {};
        const cmds = [...News.commander.commands.values()];

        cmds.forEach((cmd) => {
            if (!categories[cmd.config.category])
                categories[cmd.config.category] = [];
            categories[cmd.config.category].push(cmd.config.name);
        });

        const cmdsembed: Eris.EmbedOptions = {
            author: {
                name: "❔ Commands",
                icon_url: News.bot.user.avatarURL
            },
            color: NewsCore.Utils.Colors.blurple.num,
            fields: [],
            footer: {
                text: `Total Commands: ${cmds.length}`
            }
        };
        Object.entries(categories).forEach(([cat, cmds]) =>
            cmdsembed.fields?.push({
                name: `${cat} [${cmds.length}]`,
                value: cmds.map((c) => `\`${c}\``).join(", ")
            })
        );
        message.channel.createMessage({ embed: cmdsembed });
    }
};

export default new NewsCore.Command(config, execute);
