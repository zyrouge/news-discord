import { Client } from "../Client";
import { Emojis } from "./Emojis";
import { Logger } from "../Utils/Logger";
import { Op } from "sequelize";

export let JobsCount = 0;

export class CronJobs {
    News: Client;
    Interval?: NodeJS.Timeout;
    timeout: number;

    constructor(News: Client, timeout: number) {
        this.News = News;
        this.timeout = timeout * 60 * 1000;
    }

    async saveBingNewsToDatabase() {
        const news = [...this.News.NewsManager.Bing.hot];
        if (news.length) {
            for (const art of news) {
                let mod = this.News.NewsManager.Bing.getModel(art);
                await this.News.Database.News.findOrCreate({
                    where: mod
                }).catch(() => {});
            }
        }
    }

    async updateGuildNewsChannels() {
        if (
            !this.News.NewsManager.Bing.hot.length ||
            !this.News.NewsManager.Bing.lastUpdated
        )
            return;

        const channels = await this.News.Database.Guild.findAll({
            where: {
                bindToChannel: {
                    [Op.ne]: null
                }
            }
        });

        for (const GuildDB of channels) {
            const channelID = GuildDB.getDataValue("autoNewsChannel");
            if (!channelID) continue;

            const channel = this.News.bot.guilds
                .get(GuildDB.getDataValue("guildID"))
                ?.channels.get(channelID);

            const description = this.News.NewsManager.Bing.embeds[0];
            if (channel && "createMessage" in channel) {
                const prefix =
                    GuildDB.getDataValue("prefix") ||
                    this.News.options.config.prefix;

                channel.createMessage({
                    embed: {
                        title: `${Emojis.fire} Hot Headlines`,
                        description,
                        timestamp: new Date(
                            this.News.NewsManager.Bing.lastUpdated
                        ),
                        footer: {
                            text: `Use ${prefix}hot to view all • Last updated at`,
                            icon_url: this.News.bot.user.avatarURL
                        }
                    }
                });
            }
        }
    }

    start() {
        this.run();
        this.Interval = setInterval(() => this.run(true), this.timeout);
    }

    destroy() {
        if (this.Interval) clearInterval(this.Interval);
    }

    async run(isSecondRun: boolean = false) {
        const started = Date.now();

        await this.saveBingNewsToDatabase();
        if (isSecondRun) await this.updateGuildNewsChannels();

        JobsCount = JobsCount + 1;
        Logger.log(
            `Completed CronJobs (#${JobsCount}) in ${Date.now() - started}ms`
        );
    }
}
