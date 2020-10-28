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
    name: "configuration",
    aliases: ["config", "conf"],
    description: "Configurate settings",
    usage: "",
    example: [""],
    category: "Configuration",
    available: "Guild",
    permissions: {
        user: {
            manageGuild: true
        }
    }
};
exports.execute = (News, { message, guild, guildDB }) => __awaiter(void 0, void 0, void 0, function* () {
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
    const desc = [];
    desc.push(`**Prefix:** \`${guildDB.getDataValue("prefix") || News.options.config.prefix}\``);
    const bound = guildDB.getDataValue("bindToChannel");
    desc.push(`**Bound Channel:** ${bound ? `<#${bound}>` : "None"}`);
    message.channel.createMessage({
        embed: {
            author: {
                name: `Configuration of ${guild.name}`,
                icon_url: guild.iconURL
            },
            description: desc.join("\n"),
            color: NewsCore.Utils.Colors.blurple.num
        }
    });
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
