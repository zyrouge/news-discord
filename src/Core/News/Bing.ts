import { Constants } from "../Constants";
import { JSDOM } from "jsdom";
import { Logger } from "../Utils/Logger";
import { NewsAttributes } from "../Database/Models/News";
import DayJS from "dayjs";
import parse from "parse-duration";
import Eris from "eris";
const UserAgents: string[] = require("../../../data/userAgents.json");

export interface BingNews {
    id: string;
    title: string;
    url: string;
    description?: string;
    image?: string;
    source: {
        name?: string;
        image?: string;
    };
    time?: number;
    date?: string;
}

export interface BingManagerOptions {
    updateInterval: number;
}

export class BingManager {
    options: BingManagerOptions;
    lastUpdated?: number;
    hot: BingNews[];
    cache: BingNews[];
    autoUpdateInterval?: NodeJS.Timeout;

    constructor(options: BingManagerOptions) {
        this.options = options;
        this.options.updateInterval = 1 * 60 * 1000;
        this.hot = [];
        this.cache = [];

        if (this.options.updateInterval) this.autoUpdate();
    }

    get(id: string) {
        return this.all().find((x) => x.id === id);
    }

    has(id: string) {
        return !!this.get(id);
    }

    all() {
        return [...this.cache];
    }

    async headlines() {
        if (
            this.lastUpdated &&
            Date.now() - this.lastUpdated <
                this.options.updateInterval * 60 * 1000
        )
            return this.hot;

        const startTime = Date.now();
        Logger.log("Updating Bing Headlines...");

        const DOM = await JSDOM.fromURL(Constants.bing.base);
        const headlines = DOM.window.document.querySelectorAll(
            ".news-card.news-headlines-card.news-headlines-card-normal"
        );
        this.hot = [];
        for (const headline of headlines) {
            const caption = headline.querySelector(".caption");
            const captionAnchor = caption?.querySelector("a");
            const title = captionAnchor ? captionAnchor?.textContent : null;
            const url = captionAnchor?.href;
            const imageDiv = headline
                .querySelector(".image")
                ?.querySelector("img");
            const image = imageDiv?.src;
            const source = headline.querySelector(".source");
            const sourceTitle = source?.querySelector("a")?.textContent;
            const sourceImage = source?.querySelector("img")?.src;
            const timeAgo = source?.lastChild?.textContent;
            const timeParsed = timeAgo ? parse(timeAgo) : undefined;
            const time = timeParsed
                ? DayJS().subtract(timeParsed, "ms")
                : undefined;

            if (title && url) {
                const news: BingNews = {
                    id: url,
                    title,
                    url,
                    image,
                    source: {
                        name: sourceTitle || undefined,
                        image: sourceImage || undefined
                    },
                    time: time?.valueOf(),
                    date: time?.format("YYYY-MM-DD")
                };
                if (
                    !this.all()
                        .map((n) => n.url)
                        .includes(news.url)
                ) {
                    this.cache.push(news);
                }
                this.hot.push(news);
            }
        }

        Logger.log(`Updated Bing Headlines in ${Date.now() - startTime}ms`);
        this.lastUpdated = startTime;
    }

    async search(term: string) {
        const dom = await JSDOM.fromURL(
            `${Constants.bing.base}/search?q=${encodeURIComponent(term)}`,
            {
                userAgent: UserAgents.random()
            }
        );
        const newsDivs = dom.window.document.querySelectorAll(
            ".news-card-body.card-with-cluster"
        );
        const news = [];
        for (const newsDiv of newsDivs) {
            const article = await this.parseNewsCard(newsDiv);
            if (article.title && article.url) {
                news.push(article);
                if (!this.has(article.id)) this.cache.push(article);
            }
        }
        return news;
    }

    async parseNewsCard(cardDiv: Element) {
        const captionDiv = cardDiv.querySelector(".caption");
        const titleDiv = captionDiv?.querySelector(".title") || undefined;
        const title = titleDiv?.textContent || undefined;
        const urlAnchor = captionDiv?.querySelector("a") || undefined;
        const url = urlAnchor?.href || undefined;
        const descriptionDiv = cardDiv.querySelector(".snippet");
        const description = descriptionDiv?.textContent || undefined;
        const imageDiv = cardDiv.querySelector(".image");
        const imageElement = imageDiv?.querySelector("img") || undefined;
        const image = imageElement?.src || undefined;
        const sourceDiv = cardDiv.querySelector(".source");
        const sourceAnchor = sourceDiv?.querySelector("a") || undefined;
        const sourceAnchorURL = sourceAnchor?.href || undefined;
        const sourceImage = sourceDiv?.querySelector("img")?.src || undefined;

        return {
            id: url,
            title,
            url: url,
            description,
            image: Constants.bing.url + image,
            source: {
                name: sourceAnchor?.textContent || undefined,
                image: sourceImage
                    ? Constants.bing.url + sourceImage
                    : undefined,
                url: sourceAnchorURL || undefined
            }
        } as BingNews;
    }

    autoUpdate() {
        this.autoUpdateInterval = setInterval(() => {
            this.headlines();
        }, this.options.updateInterval);
    }

    destroyAutoUpdate() {
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
            delete this.autoUpdateInterval;
        }
    }

    getEmbed(news: BingNews) {
        return {
            title: news.title,
            url: news.url,
            image: {
                url: news.image
            },
            footer: {
                text: news.source.name,
                icon_url: news.source.image
            }
        } as Eris.EmbedOptions;
    }

    getModel({
        id,
        title,
        url,
        description,
        image,
        source: { name: sourceName, image: sourceImage },
        time,
        date
    }: BingNews) {
        const model: NewsAttributes = {
            id: id,
            title: title,
            url: url,
            description: description || null,
            image: image || null,
            sourceName: sourceName || null,
            sourceImage: sourceImage || null,
            time: time || null,
            date: date || null
        };
        return model;
    }

    random() {
        return this.all().random();
    }
}
