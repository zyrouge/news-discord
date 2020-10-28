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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJobs = exports.JobsCount = void 0;
const Emojis_1 = require("./Emojis");
const Logger_1 = require("../Utils/Logger");
const sequelize_1 = require("sequelize");
exports.JobsCount = 0;
class CronJobs {
    constructor(News, timeout) {
        this.News = News;
        this.timeout = timeout * 60 * 1000;
    }
    saveBingNewsToDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            const news = [...this.News.NewsManager.Bing.hot];
            if (news.length) {
                for (const art of news) {
                    let mod = this.News.NewsManager.Bing.getModel(art);
                    yield this.News.Database.News.findOrCreate({
                        where: mod
                    }).catch(() => { });
                }
            }
        });
    }
    updateGuildNewsChannels() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.News.NewsManager.Bing.hot.length ||
                !this.News.NewsManager.Bing.lastUpdated)
                return;
            const channels = yield this.News.Database.Guild.findAll({
                where: {
                    bindToChannel: {
                        [sequelize_1.Op.ne]: null
                    }
                }
            });
            for (const GuildDB of channels) {
                const channelID = GuildDB.getDataValue("autoNewsChannel");
                if (!channelID)
                    continue;
                const channel = (_a = this.News.bot.guilds
                    .get(GuildDB.getDataValue("guildID"))) === null || _a === void 0 ? void 0 : _a.channels.get(channelID);
                const topic = GuildDB.getDataValue("autoNewsTopic");
                let description;
                const date = new Date(this.News.NewsManager.Bing.lastUpdated);
                if (topic) {
                    const newArts = yield this.News.NewsManager.Bing.search(topic);
                    description = this.News.NewsManager.Bing.createPages(newArts)[0];
                }
                else
                    description = this.News.NewsManager.Bing.embeds[0];
                if (channel && "createMessage" in channel && description) {
                    const prefix = GuildDB.getDataValue("prefix") ||
                        this.News.options.config.prefix;
                    channel.createMessage({
                        embed: {
                            title: `${Emojis_1.Emojis.fire} Hot Headlines`,
                            description: description,
                            timestamp: date,
                            footer: {
                                text: `Use ${prefix}hot to view latest news • Last updated at`,
                                icon_url: this.News.bot.user.avatarURL
                            }
                        }
                    });
                }
            }
        });
    }
    start() {
        this.run();
        this.Interval = setInterval(() => this.run(true), this.timeout);
    }
    destroy() {
        if (this.Interval)
            clearInterval(this.Interval);
    }
    run(isSecondRun = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const started = Date.now();
            const CronLog = Logger_1.Logger.Ora(`Doing CronJobs (#${exports.JobsCount})`).start();
            yield this.saveBingNewsToDatabase();
            if (isSecondRun)
                yield this.updateGuildNewsChannels();
            exports.JobsCount = exports.JobsCount + 1;
            CronLog.succeed(`Completed CronJobs (#${exports.JobsCount}) in ${Date.now() - started}ms`);
        });
    }
}
exports.CronJobs = CronJobs;
