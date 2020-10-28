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
exports.Client = exports.ClientUtils = void 0;
const eris_1 = __importDefault(require("eris"));
const Command_1 = require("./Command");
const News_1 = require("./News");
const Database_1 = require("./Database");
const Utils_1 = require("./Utils");
const CronJobs_1 = require("./Utils/CronJobs");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class ClientUtils {
    constructor(News) {
        this.News = News;
        this.Permissions = new Utils_1.Permissions(News);
    }
    clean(text) {
        const token = this.News.bot.token || "token";
        return text.replace(new RegExp(token, "g"), Buffer.from(this.News.bot.user.id).toString("base64") +
            new Array(30)
                .fill(null)
                .map(() => String.fromCharCode(Math.floor(Math.random() * (122 - 35)) + 35))
                .join(""));
    }
}
exports.ClientUtils = ClientUtils;
class Client {
    constructor(token, options) {
        this.bot = new eris_1.default.Client(token, options === null || options === void 0 ? void 0 : options.eris);
        this.options = options;
        this.commander = new Command_1.CommandHandler(this);
        if (!process.env.GUARDIAN_API)
            throw new Error("'GUARDIAN_API' was not found in '.env'");
        this.NewsManager = new News_1.NewsManager({
            guardianKey: process.env.GUARDIAN_API
        });
        if (!process.env.DATABASE_PATH)
            throw new Error("'DATABASE_PATH' was not found in '.env'");
        if (!process.env.DATABASE_NAME)
            throw new Error("'DATABASE_NAME' was not found in '.env'");
        this.Database = new Database_1.DatabaseManager(process.env.DATABASE_PATH, process.env.DATABASE_NAME + ".sqlite");
        this.Utils = new ClientUtils(this);
        this.CronJobs = new CronJobs_1.CronJobs(this, 5);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const EventLoadLog = Utils_1.Logger.Ora(`Loading Events from ${Utils_1.Logger.chalk.underline(this.options.events)}`).start();
            const eventFiles = yield fs_1.promises.readdir(this.options.events);
            for (const file of eventFiles) {
                const name = file.split(".")[0];
                const event = require(path_1.default.join(this.options.events, file))
                    .default;
                this.bot.on(name, (...args) => event.execute(this, ...args));
                EventLoadLog.text = `Event loaded: ${Utils_1.Logger.chalk.underline(file)}`;
            }
            EventLoadLog.succeed(`${eventFiles.length} Events has been loaded`);
            const CommandLoadLog = Utils_1.Logger.Ora(`Loading Commands from ${Utils_1.Logger.chalk.underline(this.options.events)}`).start();
            const commandFiles = yield fs_1.promises.readdir(this.options.commands);
            for (const file of commandFiles) {
                this.commander.load(file);
                CommandLoadLog.text = `Command loaded: ${Utils_1.Logger.chalk.underline(file.split(".")[0])}`;
            }
            CommandLoadLog.succeed(`${commandFiles.length} Commands has been loaded`);
        });
    }
    finalize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Database.connect();
            yield this.NewsManager.Bing.headlines();
            yield this.CronJobs.start();
            yield this.bot.connect();
            return;
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bot.disconnect({ reconnect: false });
            return;
        });
    }
}
exports.Client = Client;
