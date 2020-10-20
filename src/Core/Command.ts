import { Client } from "./Client";
import { Collection } from "./Collection";
import path from "path";
import { promises as fs } from "fs";
import Eris from "eris";
import { Colors } from "./Utils/Colors";
import { GuildModel } from "./Database/Models/Guild";

export type CommandAvailability = "Guild" | "DM" | "Guild NSFW" | "Any";

interface PermJSON {
    [s: string]: boolean;
}

export interface CommandConfig {
    name: string;
    aliases?: string[];
    description: string;
    permissions?: {
        user?: PermJSON;
        bot?: PermJSON;
    };
    usage: string;
    example: string[];
    cooldown?: number;
    category:
        | "News"
        | "Help"
        | "Misc"
        | "Utils"
        | "Developer"
        | "Configuration";
    available: CommandAvailability;
}

export interface CommandArguments {
    message: Eris.Message;
    args: string[];
    type: CommandAvailability;
    guild?: Eris.Guild;
    guildDB?: GuildModel;
    prefix: string;
}

export type CommandExecute = (
    News: Client,
    args: CommandArguments
) => Promise<any>;

export const defaultMainFile = "index.js";

export class Command {
    config: CommandConfig;
    execute: CommandExecute;
    dir?: string;
    subcommands: Collection<string, Command>;
    subaliases: Collection<string, string>;
    fullName?: string;

    constructor(config: CommandConfig, execute: CommandExecute) {
        this.config = config;
        this.execute = execute;
        this.subcommands = new Collection();
        this.subaliases = new Collection();
    }

    async process(News: Client, args: CommandArguments) {
        const [subName, ...newArgs] = args.args;
        const subcmd = this.resolveSubCommand(subName);
        if (subcmd) {
            args.args = newArgs;
            await subcmd.process(News, args);
        } else {
            await this.execute(News, args);
        }
    }

    resolveSubCommand(name: string) {
        const alias = this.subaliases.get(name);
        return this.subcommands.get(alias || name);
    }
}

export class CommandHandler {
    News: Client;
    commands: Collection<string, Command>;
    aliases: Collection<string, string>;

    constructor(News: Client) {
        this.News = News;
        this.commands = new Collection();
        this.aliases = new Collection();
    }

    async load(commandName: string) {
        const hasSub = !commandName.endsWith(".js");
        const dir = path.resolve(this.News.options.commands, commandName);
        const command: Command = require(!hasSub
            ? dir
            : path.join(dir, defaultMainFile)).default;
        command.dir = dir;
        command.fullName = command.config.name;
        this.commands.set(command.config.name, command);
        command.config.aliases?.forEach((alias) =>
            this.aliases.set(alias, command.config.name)
        );
        if (hasSub) this.loadSubs(dir, command);
    }

    async loadSubs(dir: string, mainCmd: Command) {
        const files = (await fs.readdir(dir)).filter(
            (file) => file !== defaultMainFile
        );
        for (const file of files) {
            const hasSub = !file.endsWith(".js");
            const subdir = path.join(dir, file);
            const command: Command = !hasSub
                ? require(subdir).default
                : path.join(subdir, defaultMainFile);
            command.dir = subdir;
            command.fullName = `${mainCmd.fullName} ${command.config.name}`;
            mainCmd.subcommands.set(command.config.name, command);
            command.config.aliases?.forEach((alias) =>
                mainCmd.subaliases.set(alias, command.config.name)
            );
            if (hasSub) this.loadSubs(subdir, command);
        }
    }

    async unload(commandName: string) {
        const command = this.commands.get(commandName);
        this.commands.delete(commandName);
        command?.config.aliases?.forEach((alias) => this.aliases.delete(alias));
        if (command && command.dir)
            delete require.cache[require.resolve(command.dir)];
    }

    async reload(commandName: string) {
        await this.unload(commandName);
        await this.load(commandName + ".js");
    }

    async handleMessage(message: Eris.Message) {
        if (message.author.bot) return false;

        const [GuildDB] = message.guildID
            ? await this.News.Database.Guild.findOrCreate({
                  where: {
                      guildID: message.guildID
                  }
              })
            : [null];

        const wPrefix =
            GuildDB?.getDataValue("prefix") || this.News.options.config.prefix;
        const mPrefix = this.News.bot.user.mention;
        const startsWithMention = this.startsWithPrefix(
            message.content,
            mPrefix
        );
        const startsWithPrefix = this.startsWithPrefix(
            message.content,
            wPrefix
        );
        const prefix = startsWithMention
            ? mPrefix
            : startsWithPrefix
            ? wPrefix
            : undefined;
        if (!prefix) return false;

        const args = message.content
            .replace(/<@!/g, "<@")
            .substring(prefix.length)
            .trim()
            .split(/\s+/g);
        if (!args) return false;

        const label = args.shift()?.toLowerCase();
        if (!label) return false;

        const command = this.resolveCommand(label);
        if (!command) return false;

        if (
            command.config.category === "Developer" &&
            !this.News.options.config.owners.includes(message.author.id)
        )
            return message.channel.createMessage("No Perms");

        const cmdArgs: CommandArguments = {
            message,
            args,
            type: "Any",
            prefix
        };

        if (command.config.available === "DM") {
            if (message.channel.type !== Eris.Constants.ChannelTypes.DM)
                return false;
            cmdArgs.type = "DM";
        }

        if (command.config.available === "Guild NSFW") {
            if (!("nsfw" in message.channel) || message.channel.nsfw !== true)
                return false;
            cmdArgs.type = "Guild NSFW";
        }

        const guild =
            "guild" in message.channel ? message.channel.guild : undefined;
        if (command.config.available === "Guild") {
            if (!guild) return false;
            cmdArgs.type = "Guild";
            cmdArgs.guild = guild;
            cmdArgs.guildDB = GuildDB || undefined;
        }

        await command.process(this.News, cmdArgs);
        return true;
    }

    startsWithPrefix(content: string, prefix: string) {
        return content.replace(/<@!/g, "<@").startsWith(prefix);
    }

    resolveCommand(name: string) {
        const alias = this.aliases.get(name);
        return this.commands.get(alias || name);
    }

    getEmbed(cmd: Command) {
        let description: string[] = [],
            fields: Eris.EmbedField[] = [];

        description.push(`**About:** ${cmd.config.description}`);

        if (cmd.config.aliases?.length)
            description.push(
                `**Aliases:** ${cmd.config.aliases
                    .map((a) => `\`${a}\``)
                    .join(", ")}`
            );

        description.push(`**Category:** ${cmd.config.category}`);

        if (cmd.config.cooldown)
            description.push(`**Cooldown:** ${cmd.config.cooldown}s`);

        description.push(`**Availability:** ${cmd.config.available}`);

        const subcommands = [...cmd.subcommands.values()];
        if (subcommands.length)
            description.push(
                `**Subcommands:** ${subcommands
                    .map((s) => `\`${s.config.name}\``)
                    .join(", ")}`
            );

        const cmdFullName =
            this.News.options.config.prefix + (cmd.fullName || cmd.config.name);
        fields.push({
            name: "Usage",
            value: `\`\`\`${cmdFullName} ${cmd.config.usage}\`\`\``
        });

        if (cmd.config.example.length) {
            let examples: string[] = [];
            cmd.config.example.forEach((e) =>
                examples.push(`${cmdFullName} ${e}`)
            );
            fields.push({
                name: "Example",
                value: `\`\`\`${examples.join("\n")}\`\`\``
            });
        }

        return {
            title: `Command: ${cmd.config.name.toProperCase()}`,
            description: description.join("\n"),
            color: Colors.blurple.num,
            fields
        } as Eris.EmbedOptions;
    }
}
