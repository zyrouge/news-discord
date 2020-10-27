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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.config = void 0;
const NewsCore = __importStar(require("../Core"));
const axios_1 = __importDefault(require("axios"));
exports.config = {
    name: "urban",
    aliases: ["ur", "dictionary", "dict"],
    description: "Search meanings of unknown words",
    usage: "<word>",
    example: ["celestial"],
    category: "Utils",
    available: "Guild NSFW"
};
exports.execute = (News, { message, args }) => __awaiter(void 0, void 0, void 0, function* () {
    const terms = args.join(" ");
    if (!terms.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Mention a Date to retrieve News",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    const response = yield axios_1.default.get(NewsCore.Constants.urban.search + encodeURIComponent(terms));
    const data = response.data;
    if (!data || !data.list || !data.list.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: `No results for ${terms}`,
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    let defNum = 0;
    const arrows = { left: "⬅️", right: "➡️" };
    const emjAr = Object.values(arrows);
    const msg = yield message.channel.createMessage({
        embed: getEmbed(data.list[defNum])
    });
    emjAr.forEach((e) => msg.addReaction(e).catch(() => { }));
    const reactor = new NewsCore.Utils.ReactionHandler(News.bot, msg, (userID) => userID === message.author.id, false, { maxMatches: 10, time: 1 * 60 * 1000 });
    reactor.on("reacted", (reaction) => {
        if (emjAr.includes(reaction.emoji.name)) {
            if (reaction.emoji.name === arrows.left) {
                if (data.list[defNum - 1])
                    defNum -= 1;
                else
                    defNum = data.list.length - 1;
            }
            else if (reaction.emoji.name === arrows.right) {
                if (data.list[defNum + 1])
                    defNum += 1;
                else
                    defNum = 0;
            }
            msg.edit({ embed: getEmbed(data.list[defNum]) });
            msg.removeReaction(reaction.emoji.name, message.author.id).catch(() => { });
        }
    });
    reactor.on("end", () => {
        msg.removeReactions().catch(() => { });
    });
    function getEmbed(def) {
        const fields = [];
        if (def.definition)
            fields.push({
                name: "Definition",
                value: def.definition.shorten(600)
            });
        if (def.example)
            fields.push({
                name: "Examples",
                value: def.example.shorten(600)
            });
        const embed = {
            title: `Word: ${def.word}`,
            url: def.permalink,
            color: NewsCore.Utils.Colors.blurple.num,
            fields: fields,
            footer: {
                text: `Definition #${defNum + 1} of ${data.list.length} • 👍 ${def.thumbs_up || 0} • 👎 ${def.thumbs_down || 0}`
            }
        };
        return embed;
    }
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
