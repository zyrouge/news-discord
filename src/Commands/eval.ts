import * as NewsCore from "../Core";
import { inspect } from "util";

export const config: NewsCore.CommandConfig = {
    name: "eval",
    aliases: ["ev"],
    description: "Eval's JS Code",
    usage: "<code>",
    example: ["console.log('hello world')"],
    category: "Developer",
    available: "Any"
};

export const execute: NewsCore.CommandExecute = async (
    News: NewsCore.Client,
    { message, args }: NewsCore.CommandArguments
) => {
    const code = args.join(" ");
    try {
        const result = eval(code);
        const inspected = inspect(result);
        const cleaned = News.Utils.clean(inspected);
        message.channel.createMessage({
            embed: {
                color: NewsCore.Utils.Colors.green.num,
                fields: [
                    {
                        name: `${NewsCore.Utils.Emojis.tick} Success`,
                        value: `\`\`\`xl\n${cleaned.shorten(500, true)}\`\`\``
                    }
                ]
            }
        });
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
