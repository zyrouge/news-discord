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
const dayjs_1 = __importDefault(require("dayjs"));
exports.config = {
    name: "dated",
    aliases: ["date"],
    description: "Ping Pong!",
    usage: "<YYYY-MM-DD|date>",
    example: ["2020-10-20"],
    category: "News",
    available: "Any"
};
exports.execute = (News, { message, args }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!args[0])
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Mention a Date to retrieve News",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    const date = dayjs_1.default(args[0]).format("YYYY-MM-DD");
    if (date === "Invalid Date")
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "Invalid Date was provided",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    const news = yield News.Database.News.findAll({
        where: {
            date: date
        },
        limit: 10
    });
    if (!news.length)
        return message.channel.createMessage({
            embed: {
                author: {
                    name: "No News were found for the provided Date",
                    icon_url: NewsCore.Utils.Emojis.cross.url
                },
                color: NewsCore.Utils.Colors.red.num
            }
        });
    let description = "";
    news.forEach((n, i) => {
        let title = n.getDataValue("title"), url = n.getDataValue("url");
        if (description.length + title.length + url.length < 2000)
            description += `\n\`${i + 1}\` **[${title}](${url})**`;
    });
    const embed = {
        title: "Headlines",
        url: NewsCore.Constants.bing.base,
        color: NewsCore.Constants.bing.color,
        thumbnail: {
            url: NewsCore.Constants.bing.icon
        },
        description: description,
        timestamp: date,
        footer: {
            text: "News of"
        }
    };
    message.channel.createMessage({ embed });
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
