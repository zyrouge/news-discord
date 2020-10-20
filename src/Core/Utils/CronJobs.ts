import { Client } from "../Client";

export class CronJobs {
    News: Client;
    Interval?: NodeJS.Timeout;

    constructor(News: Client) {
        this.News = News;
    }

    async saveBingNewsToDatabase() {
        const news = [...this.News.NewsManager.Bing.hot];
        if (news.length) {
            for (const art of news) {
                const mod = this.News.NewsManager.Bing.getModel(art);
                await this.News.Database.News.findOrCreate({
                    where: mod
                });
            }
        }
    }

    start() {
        this.Interval = setInterval(() => this.run(), 12000);
    }

    async run() {
        await this.saveBingNewsToDatabase();
    }
}
