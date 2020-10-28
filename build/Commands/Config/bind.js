"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.config = void 0;
const NewsCore = __importStar(require("../../Core"));
exports.config = {
    name: "bind",
    aliases: ["bound"],
    description: "Bind News Bot to a Channel!",
    usage: "[#channel|channel_id]",
    example: ["#news", "594543235607822367"],
    category: "Configuration",
    available: "Guild"
};
exports.execute = (News, { message, args, guild, guildDB }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!guild || !guildDB)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Guild does not exist in cache. Please report this issue in our Discord Server!",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    const arg1 = args[0];
    if (!arg1)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "No Channel ID or Mention was provided.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    if (NewsCore.Constants.keywords.remove.includes(arg1.toLowerCase())) {
        const ChannelID = !Number.isNaN(arg1)
            ? NewsCore.Utils.MentionsManager.ChannelMention(arg1)
            : arg1;
        const MChannel = ChannelID ? guild.channels.get(ChannelID) : undefined;
        if (!MChannel)
            return message.channel.createMessage({
                embed: {
                    author: {
                        name: "Invalid Channel ID or Mention was provided.",
                        icon_url: NewsCore.Utils.Emojis.cross.url
                    },
                    color: NewsCore.Utils.Colors.red.num
                }
            });
        yield guildDB.update({
            bindToChannel: MChannel.id
        });
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Invalid Channel ID or Mention was provided.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                description: `**${News.bot.user.username}** has been bound to ${MChannel.mention}`,
                color: NewsCore.Utils.Colors.red.num
            }
        });
    }
    else {
        yield guildDB.update({
            bindToChannel: undefined
        });
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Invalid Channel ID or Mention was provided.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                description: `**${News.bot.user.username}** has been bound to **None**`,
                color: NewsCore.Utils.Colors.red.num
            }
        });
    }
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
