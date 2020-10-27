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
const NewsCore = __importStar(require("../Core"));
exports.config = {
    name: "hot",
    aliases: ["news", "latest", "headlines"],
    description: "Latest News",
    usage: "[number]",
    example: ["", "3"],
    category: "News",
    available: "Any"
};
exports.execute = (News, { message, args }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!News.NewsManager.Bing.lastUpdated ||
        !News.NewsManager.Bing.hot.length ||
        !News.NewsManager.Bing.embeds.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "No headlines were found.",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    let index = args[0] !== undefined ? parseInt(args[0]) : null;
    if (index) {
        if (isNaN(index))
            return message.channel.createMessage({
                embed: {
                    author: {
                        name: "Invalid News Index.",
                        icon_url: NewsCore.Utils.Emojis.cross.url
                    },
                    color: NewsCore.Utils.Colors.red.num
                }
            });
        const headline = News.NewsManager.Bing.hot[index - 1];
        if (!headline)
            return message.channel.createMessage({
                embed: {
                    author: {
                        name: "Headline with that index was not found.",
                        icon_url: NewsCore.Utils.Emojis.cross.url
                    },
                    color: NewsCore.Utils.Colors.red.num
                }
            });
        const embed = News.NewsManager.Bing.getEmbed(headline);
        embed.color = NewsCore.Constants.bing.color;
        return message.channel.createMessage({ embed });
    }
    const headlines = News.NewsManager.Bing.embeds;
    let current = 0;
    const arrows = { left: "⬅️", right: "➡️" };
    const emjAr = Object.values(arrows);
    const msg = yield message.channel.createMessage({
        embed: getEmbed(headlines[current])
    });
    if (headlines.length > 1) {
        emjAr.forEach((e) => msg.addReaction(e).catch(() => { }));
        const reactor = new NewsCore.Utils.ReactionHandler(News.bot, msg, (userID) => userID === message.author.id, false, { maxMatches: 10, time: 1 * 60 * 1000 });
        reactor.on("reacted", (reaction) => {
            if (emjAr.includes(reaction.emoji.name)) {
                if (reaction.emoji.name === arrows.left) {
                    if (headlines[current - 1])
                        current -= 1;
                    else
                        current = headlines.length - 1;
                }
                else if (reaction.emoji.name === arrows.right) {
                    if (headlines[current + 1])
                        current += 1;
                    else
                        current = 0;
                }
                msg.edit({ embed: getEmbed(headlines[current]) });
                msg.removeReaction(reaction.emoji.name, message.author.id).catch(() => { });
            }
        });
        reactor.on("end", () => {
            msg.removeReactions().catch(() => { });
        });
    }
    function getEmbed(description) {
        const embed = {
            title: `${NewsCore.Utils.Emojis.fire} Recent Headlines`,
            url: NewsCore.Constants.bing.base,
            color: NewsCore.Constants.bing.color,
            thumbnail: {
                url: NewsCore.Constants.bing.icon
            },
            description: description,
            timestamp: News.NewsManager.Bing.lastUpdated
                ? new Date(News.NewsManager.Bing.lastUpdated)
                : undefined,
            footer: {
                text: `Page #${current + 1} of ${News.NewsManager.Bing.embeds.length} • Last updated at`
            }
        };
        return embed;
    }
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
