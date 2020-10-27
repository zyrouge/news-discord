"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = exports.Command = exports.defaultMainFile = void 0;
const Collection_1 = require("./Collection");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const eris_1 = __importDefault(require("eris"));
const Colors_1 = require("./Utils/Colors");
const Emojis_1 = require("./Utils/Emojis");
exports.defaultMainFile = "index.js";
class Command {
    constructor(config, execute) {
        this.config = config;
        this.execute = execute;
        this.subcommands = new Collection_1.Collection();
        this.subaliases = new Collection_1.Collection();
    }
    process(News, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const [subName, ...newArgs] = args.args;
            const subcmd = this.resolveSubCommand(subName);
            if (subcmd) {
                args.args = newArgs;
                yield subcmd.process(News, args);
            }
            else {
                yield this.execute(News, args);
            }
        });
    }
    resolveSubCommand(name) {
        const alias = this.subaliases.get(name);
        return this.subcommands.get(alias || name);
    }
}
exports.Command = Command;
class CommandHandler {
    constructor(News) {
        this.News = News;
        this.commands = new Collection_1.Collection();
        this.aliases = new Collection_1.Collection();
    }
    load(commandName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const hasSub = !commandName.endsWith(".js");
            const dir = path_1.default.resolve(this.News.options.commands, commandName);
            const command = require(!hasSub
                ? dir
                : path_1.default.join(dir, exports.defaultMainFile)).default;
            command.dir = dir;
            command.fullName = command.config.name;
            this.commands.set(command.config.name, command);
            (_a = command.config.aliases) === null || _a === void 0 ? void 0 : _a.forEach((alias) => this.aliases.set(alias, command.config.name));
            if (hasSub)
                this.loadSubs(dir, command);
        });
    }
    loadSubs(dir, mainCmd) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const files = (yield fs_1.promises.readdir(dir)).filter((file) => file !== exports.defaultMainFile);
            for (const file of files) {
                const hasSub = !file.endsWith(".js");
                const subdir = path_1.default.join(dir, file);
                const command = !hasSub
                    ? require(subdir).default
                    : path_1.default.join(subdir, exports.defaultMainFile);
                command.dir = subdir;
                command.fullName = `${mainCmd.fullName} ${command.config.name}`;
                mainCmd.subcommands.set(command.config.name, command);
                (_a = command.config.aliases) === null || _a === void 0 ? void 0 : _a.forEach((alias) => mainCmd.subaliases.set(alias, command.config.name));
                if (hasSub)
                    this.loadSubs(subdir, command);
            }
        });
    }
    unload(commandName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const command = this.commands.get(commandName);
            this.commands.delete(commandName);
            (_a = command === null || command === void 0 ? void 0 : command.config.aliases) === null || _a === void 0 ? void 0 : _a.forEach((alias) => this.aliases.delete(alias));
            if (command && command.dir)
                delete require.cache[require.resolve(command.dir)];
        });
    }
    reload(commandName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.unload(commandName);
            yield this.load(commandName + ".js");
        });
    }
    handleMessage(message) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            if (message.author.bot)
                return false;
            const errorEmbed = {
                author: {
                    name: "Command Execution Error",
                    icon_url: Emojis_1.Emojis.cross.url
                },
                color: Colors_1.Colors.red.num
            };
            const [GuildDB] = message.guildID
                ? yield this.News.Database.Guild.findOrCreate({
                    where: {
                        guildID: message.guildID
                    }
                })
                : [null];
            const wPrefix = (GuildDB === null || GuildDB === void 0 ? void 0 : GuildDB.getDataValue("prefix")) || this.News.options.config.prefix;
            const mPrefix = this.News.bot.user.mention;
            const startsWithMention = this.startsWithPrefix(message.content, mPrefix);
            const startsWithPrefix = this.startsWithPrefix(message.content, wPrefix);
            const prefix = startsWithMention
                ? mPrefix
                : startsWithPrefix
                    ? wPrefix
                    : undefined;
            if (!prefix)
                return false;
            const args = message.content
                .replace(/<@!/g, "<@")
                .substring(prefix.length)
                .trim()
                .split(/\s+/g);
            if (!args)
                return false;
            const label = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (!label)
                return false;
            const command = this.resolveCommand(label);
            if (!command)
                return false;
            if (command.config.category === "Developer" &&
                !this.News.options.config.owners.includes(message.author.id))
                return message.channel.createMessage({
                    embed: Object.assign(Object.assign({}, errorEmbed), { description: "Command reserved to **Developers**" })
                });
            if ("guild" in message.channel &&
                GuildDB &&
                !((_b = message.member) === null || _b === void 0 ? void 0 : _b.permission.has("manageGuild"))) {
                const bindChannel = GuildDB.getDataValue("bindToChannel");
                if (bindChannel && message.channel.id !== bindChannel)
                    return message.channel.createMessage({
                        embed: Object.assign(Object.assign({}, errorEmbed), { description: `All commands are bound to <#${bindChannel}>` })
                    });
            }
            if ("guild" in message.channel &&
                message.member &&
                command.config.permissions) {
                if (command.config.permissions.user) {
                    const userPerms = ((_c = message.channel.permissionOverwrites.get(message.author.id)) === null || _c === void 0 ? void 0 : _c.json) || message.member.permission.json;
                    const reqPerms = Object.entries(command.config.permissions.user);
                    const missingPerms = [];
                    for (const [perm, bool] of reqPerms) {
                        if (userPerms[perm] !== bool)
                            missingPerms.push(perm);
                    }
                    if (missingPerms.length)
                        return message.channel.createMessage({
                            embed: Object.assign(Object.assign({}, errorEmbed), { description: `You are lacking the following Permissions: ${missingPerms
                                    .map((p) => `\`${p
                                    .fromObjToSnakeCase()
                                    .toUpperCase()}\``)
                                    .join(" ")}` })
                        });
                }
                if (command.config.permissions.bot) {
                    const userPerms = ((_d = message.channel.permissionOverwrites.get(this.News.bot.user.id)) === null || _d === void 0 ? void 0 : _d.json) || ((_e = message.channel.guild.members.get(this.News.bot.user.id)) === null || _e === void 0 ? void 0 : _e.permission.json) ||
                        {};
                    const reqPerms = Object.entries(command.config.permissions.bot);
                    const missingPerms = [];
                    for (const [perm, bool] of reqPerms) {
                        if (userPerms[perm] !== bool)
                            missingPerms.push(perm);
                    }
                    if (missingPerms.length)
                        return message.channel.createMessage({
                            embed: Object.assign(Object.assign({}, errorEmbed), { description: `I am lacking the following Permissions: ${missingPerms
                                    .map((p) => `\`${p
                                    .fromObjToSnakeCase()
                                    .toUpperCase()}\``)
                                    .join(" ")}` })
                        });
                }
            }
            const cmdArgs = {
                message,
                args,
                type: "Any",
                prefix
            };
            if (command.config.available === "DM") {
                if (message.channel.type !== eris_1.default.Constants.ChannelTypes.DM)
                    return message.channel.createMessage({
                        embed: Object.assign(Object.assign({}, errorEmbed), { description: `\`${command.config.name}\` can be only used in **${command.config.available}**` })
                    });
                cmdArgs.type = "DM";
            }
            if (command.config.available === "Guild NSFW") {
                if (!("nsfw" in message.channel) || message.channel.nsfw !== true)
                    return message.channel.createMessage({
                        embed: Object.assign(Object.assign({}, errorEmbed), { description: `\`${command.config.name}\` can be only used in **${command.config.available}**` })
                    });
                cmdArgs.type = "Guild NSFW";
            }
            const guild = "guild" in message.channel ? message.channel.guild : undefined;
            if (command.config.available === "Guild") {
                if (!guild)
                    return message.channel.createMessage({
                        embed: Object.assign(Object.assign({}, errorEmbed), { description: `\`${command.config.name}\` can be only used in **${command.config.available}**` })
                    });
                cmdArgs.type = "Guild";
                cmdArgs.guild = guild;
                cmdArgs.guildDB = GuildDB || undefined;
            }
            yield command.process(this.News, cmdArgs);
            return true;
        });
    }
    startsWithPrefix(content, prefix) {
        return content.replace(/<@!/g, "<@").startsWith(prefix);
    }
    resolveCommand(name) {
        const alias = this.aliases.get(name);
        return this.commands.get(alias || name);
    }
    getEmbed(cmd) {
        var _a;
        let description = [], fields = [];
        description.push(`**About:** ${cmd.config.description}`);
        if ((_a = cmd.config.aliases) === null || _a === void 0 ? void 0 : _a.length)
            description.push(`**Aliases:** ${cmd.config.aliases
                .map((a) => `\`${a}\``)
                .join(", ")}`);
        description.push(`**Category:** ${cmd.config.category}`);
        if (cmd.config.cooldown)
            description.push(`**Cooldown:** ${cmd.config.cooldown}s`);
        description.push(`**Availability:** ${cmd.config.available}`);
        const subcommands = [...cmd.subcommands.values()];
        if (subcommands.length)
            description.push(`**Subcommands:** ${subcommands
                .map((s) => `\`${s.config.name}\``)
                .join(", ")}`);
        const cmdFullName = this.News.options.config.prefix + (cmd.fullName || cmd.config.name);
        fields.push({
            name: "Usage",
            value: `\`\`\`${cmdFullName} ${cmd.config.usage}\`\`\``
        });
        if (cmd.config.example.length) {
            let examples = [];
            cmd.config.example.forEach((e) => examples.push(`${cmdFullName} ${e}`));
            fields.push({
                name: "Example",
                value: `\`\`\`${examples.join("\n")}\`\`\``
            });
        }
        return {
            title: `Command: ${cmd.config.name.toProperCase()}`,
            description: description.join("\n"),
            color: Colors_1.Colors.blurple.num,
            fields
        };
    }
}
exports.CommandHandler = CommandHandler;
