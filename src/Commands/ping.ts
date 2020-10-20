import * as NewsCore from "../Core";

export const config: NewsCore.CommandConfig = {
    name: "ping",
    aliases: ["pong"],
    description: "Ping Pong!",
    usage: "",
    example: [""],
    category: "Misc",
    available: "Any"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message }: NewsCore.CommandArguments
) => {
    const msgtimestamp = Date.now();

    const msg = await message.channel.createMessage("Pinging...");
    msg.edit(`Pong! \`${Date.now() - msgtimestamp}ms\``);
};

export default new NewsCore.Command(config, execute);
