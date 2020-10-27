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
    name: "load",
    aliases: ["ld"],
    description: "Loads a Command",
    usage: "<name>",
    example: ["ping"],
    category: "Developer",
    available: "Any"
};
exports.execute = (News, { message, args }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!args[0])
            return message.channel.createMessage(`${NewsCore.Utils.Emojis.cross} Specify a command name.`);
        News.commander.load(args[0].endsWith(".js") ? args[0] : args[0] + ".js");
        message.channel.createMessage(`${NewsCore.Utils.Emojis.tick} Loaded \`${args[0]}\` command.`);
    }
    catch (err) {
        message.channel.createMessage({
            embed: {
                color: NewsCore.Utils.Colors.red.num,
                fields: [
                    {
                        name: `${NewsCore.Utils.Emojis.cross} Error`,
                        value: `\`\`\`xl\n${News.Utils.clean(`${err}`).shorten(500, true)}\`\`\``
                    }
                ]
            }
        });
    }
});
exports.default = new NewsCore.Command(exports.config, exports.execute);
