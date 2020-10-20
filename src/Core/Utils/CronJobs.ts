import { Client } from "../Client";
import { Logger } from "../Utils/Logger";

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
                });
            }
        }
    }

    start() {
        this.run();
        this.Interval = setInterval(() => this.run(), this.timeout);
    }

    destroy() {
        if (this.Interval) clearInterval(this.Interval);
    }

    async run() {
        const started = Date.now();
        await this.saveBingNewsToDatabase();
        Logger.log(`Completed CronJobs in ${Date.now() - started}ms`);
    }
}
