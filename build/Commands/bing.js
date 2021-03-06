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
    name: "bing",
    aliases: ["bsearch", "bs", "search"],
    description: "Search News on Bing",
    usage: "[search-terms]",
    example: ["discord"],
    category: "News",
    available: "Any"
};
exports.execute = (News, { message, args }) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    const terms = args.join(" ");
    if (!terms.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Provide some terms to search for news!",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    const msg = yield message.channel.createMessage(`Fetching results for \`${terms}\`...`);
    const articles = yield News.NewsManager.Bing.search(terms);
    if (!articles.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: `No results were found for \`${terms}\`!`,
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    const embed = {
        title: `Results for ${terms}...`,
        url: NewsCore.Constants.bing.base,
        color: NewsCore.Constants.bing.color,
        thumbnail: {
            url: NewsCore.Constants.bing.icon
        },
        fields: articles.map((n, i) => ({
            name: `\`${i + 1}\` ${n.title}`.shorten(250),
            value: `${n.description ? n.description + " " : ""}**[Read More](${n.url})**`
        })),
        timestamp: new Date(),
        footer: {
            text: `Results in ${Date.now() - startTime}ms • Requested by ${message.author.username}#${message.author.discriminator}`
        }
    };
    msg.edit({ content: "", embed });
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
