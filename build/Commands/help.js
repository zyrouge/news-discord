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
    name: "help",
    aliases: ["h", "commands", "cmds"],
    description: "Help Command!",
    usage: "[command]",
    example: ["", "ping"],
    category: "Misc",
    available: "Any"
};
exports.execute = (News, { message, args }) => __awaiter(void 0, void 0, void 0, function* () {
    if (args.length) {
        const [cmdOne, ...subs] = args;
        let cmd = News.commander.resolveCommand(cmdOne);
        if (!cmd)
            return message.channel.createMessage(`${NewsCore.Utils.Emojis.cross} Couldn\'t find anything for \`${cmdOne}\``);
        for (const sub of subs) {
            const resed = cmd === null || cmd === void 0 ? void 0 : cmd.resolveSubCommand(sub);
            if (resed)
                cmd = resed;
        }
        message.channel.createMessage({ embed: News.commander.getEmbed(cmd) });
    }
    else {
        const categories = {};
        const cmds = [...News.commander.commands.values()];
        cmds.forEach((cmd) => {
            if (!categories[cmd.config.category])
                categories[cmd.config.category] = [];
            categories[cmd.config.category].push(cmd.config.name);
        });
        const cmdsembed = {
            author: {
                name: "❔ Commands",
                icon_url: News.bot.user.avatarURL
            },
            color: NewsCore.Utils.Colors.blurple.num,
            fields: [],
            footer: {
                text: `Total Commands: ${cmds.length}`
            }
        };
        Object.entries(categories).forEach(([cat, cmds]) => { var _a; return (_a = cmdsembed.fields) === null || _a === void 0 ? void 0 : _a.push({
            name: `${cat} [${cmds.length}]`,
            value: cmds.map((c) => `\`${c}\``).join(", ")
        }); });
        message.channel.createMessage({ embed: cmdsembed });
    }
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
