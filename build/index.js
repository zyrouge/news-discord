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
const NewsCore = __importStar(require("./Core"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const Prototypes_1 = require("./Core/Utils/Prototypes");
if (process.env.NODE_ENV === "production")
    dotenv_1.default.config({ path: path_1.default.join(__dirname, "..", ".env.production") });
else if (process.env.NODE_ENV === "development")
    dotenv_1.default.config({ path: path_1.default.join(__dirname, "..", ".env.development") });
Prototypes_1.bindPrototypes();
if (!process.env.DISCORD_TOKEN)
    throw new Error("'DISCORD_TOKEN' was not found in '.env'");
NewsCore.Utils.Logger.main(`Environment: ${NewsCore.Utils.Logger.chalk.underline((process.env.NODE_ENV || "unknown").toProperCase())}`);
const config = yaml_1.default.parse(fs_1.default.readFileSync(path_1.default.resolve("config.yaml"), "utf8"));
const News = new NewsCore.Client(process.env.DISCORD_TOKEN, {
    commands: __dirname + "/Commands",
    events: __dirname + "/Events",
    config,
    eris: {
        defaultImageFormat: "png",
        defaultImageSize: 1024,
        disableEvents: {
            TYPING_START: false
        },
        maxShards: "auto",
        allowedMentions: {
            everyone: false
        }
    }
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    NewsCore.Utils.Logger.main("Initializing...");
    yield News.initialize();
    NewsCore.Utils.Logger.main("Finalizing...");
    yield News.finalize();
});
init();
