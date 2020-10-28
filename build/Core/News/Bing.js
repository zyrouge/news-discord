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
exports.BingManager = void 0;
const Constants_1 = require("../Constants");
const jsdom_1 = require("jsdom");
const Logger_1 = require("../Utils/Logger");
const dayjs_1 = __importDefault(require("dayjs"));
const parse_duration_1 = __importDefault(require("parse-duration"));
const UserAgents = require("../../../data/userAgents.json");
class BingManager {
    constructor(options) {
        this.options = options;
        this.options.updateInterval = 1 * 60 * 1000;
        this.hot = [];
        this.cache = [];
        this.embeds = [];
        if (this.options.updateInterval)
            this.autoUpdate();
    }
    get(id) {
        return this.all().find((x) => x.id === id);
    }
    has(id) {
        return !!this.get(id);
    }
    all() {
        return [...this.cache];
    }
    headlines() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.lastUpdated &&
                Date.now() - this.lastUpdated <
                    this.options.updateInterval * 60 * 1000)
                return this.hot;
            const startTime = Date.now();
            const HeadlinesLog = Logger_1.Logger.Ora("Updating Bing Headlines...").start();
            const ep = '/search?q=World&nvaug=[NewsVertical+Category="rt_World"]&FORM=NSBABR';
            const DOM = yield jsdom_1.JSDOM.fromURL(Constants_1.Constants.bing.base + encodeURIComponent(ep));
            const headlines = DOM.window.document.querySelectorAll(".news-card.news-headlines-card.news-headlines-card-normal");
            this.hot = [];
            for (const headline of headlines) {
                const caption = headline.querySelector(".caption");
                const captionAnchor = caption === null || caption === void 0 ? void 0 : caption.querySelector("a");
                const title = captionAnchor ? captionAnchor === null || captionAnchor === void 0 ? void 0 : captionAnchor.textContent : null;
                const url = captionAnchor === null || captionAnchor === void 0 ? void 0 : captionAnchor.href;
                const imageDiv = (_a = headline
                    .querySelector(".image")) === null || _a === void 0 ? void 0 : _a.querySelector("img");
                const image = imageDiv === null || imageDiv === void 0 ? void 0 : imageDiv.src;
                const source = headline.querySelector(".source");
                const sourceTitle = (_b = source === null || source === void 0 ? void 0 : source.querySelector("a")) === null || _b === void 0 ? void 0 : _b.textContent;
                const sourceImage = (_c = source === null || source === void 0 ? void 0 : source.querySelector("img")) === null || _c === void 0 ? void 0 : _c.src;
                const timeAgo = (_d = source === null || source === void 0 ? void 0 : source.lastChild) === null || _d === void 0 ? void 0 : _d.textContent;
                const timeParsed = timeAgo ? parse_duration_1.default(timeAgo) : undefined;
                const time = timeParsed
                    ? dayjs_1.default().subtract(timeParsed, "ms")
                    : undefined;
                if (title && url) {
                    const news = {
                        id: url,
                        title,
                        url,
                        image,
                        source: {
                            name: sourceTitle || undefined,
                            image: sourceImage || undefined
                        },
                        time: time === null || time === void 0 ? void 0 : time.valueOf(),
                        date: time === null || time === void 0 ? void 0 : time.format("YYYY-MM-DD")
                    };
                    if (!this.all()
                        .map((n) => n.url)
                        .includes(news.url)) {
                        this.cache.push(news);
                    }
                    this.hot.push(news);
                }
            }
            this.embeds = this.createPages(this.hot);
            HeadlinesLog.succeed(`Updated Bing Headlines in ${Date.now() - startTime}ms`);
            this.lastUpdated = startTime;
        });
    }
    createPages(arts) {
        const pages = [];
        let current = 0;
        arts.forEach((art, i) => {
            let page = pages[current];
            if (!page)
                page = "";
            const line = `\n\`${i + 1}\` **[${art.title}](${art.url})**`;
            if (page.length + art.title.length + art.url.length < 2000) {
                page += line;
            }
            else {
                current += 1;
                page += line;
            }
            pages[current] = page;
        });
        return pages;
    }
    search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            const dom = yield jsdom_1.JSDOM.fromURL(`${Constants_1.Constants.bing.base}/search?q=${encodeURIComponent(term)}`, {
                userAgent: UserAgents.random()
            });
            const newsDivs = dom.window.document.querySelectorAll(".news-card-body.card-with-cluster");
            const news = [];
            for (const newsDiv of newsDivs) {
                const article = yield this.parseNewsCard(newsDiv);
                if (article.title && article.url) {
                    news.push(article);
                    if (!this.has(article.id))
                        this.cache.push(article);
                }
            }
            return news;
        });
    }
    parseNewsCard(cardDiv) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const captionDiv = cardDiv.querySelector(".caption");
            const titleDiv = (captionDiv === null || captionDiv === void 0 ? void 0 : captionDiv.querySelector(".title")) || undefined;
            const title = (titleDiv === null || titleDiv === void 0 ? void 0 : titleDiv.textContent) || undefined;
            const urlAnchor = (captionDiv === null || captionDiv === void 0 ? void 0 : captionDiv.querySelector("a")) || undefined;
            const url = (urlAnchor === null || urlAnchor === void 0 ? void 0 : urlAnchor.href) || undefined;
            const descriptionDiv = cardDiv.querySelector(".snippet");
            const description = (descriptionDiv === null || descriptionDiv === void 0 ? void 0 : descriptionDiv.textContent) || undefined;
            const imageDiv = cardDiv.querySelector(".image");
            const imageElement = (imageDiv === null || imageDiv === void 0 ? void 0 : imageDiv.querySelector("img")) || undefined;
            const image = (imageElement === null || imageElement === void 0 ? void 0 : imageElement.src) || undefined;
            const sourceDiv = cardDiv.querySelector(".source");
            const sourceAnchor = (sourceDiv === null || sourceDiv === void 0 ? void 0 : sourceDiv.querySelector("a")) || undefined;
            const sourceAnchorURL = (sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.href) || undefined;
            const sourceImage = ((_a = sourceDiv === null || sourceDiv === void 0 ? void 0 : sourceDiv.querySelector("img")) === null || _a === void 0 ? void 0 : _a.src) || undefined;
            const timeAgo = (_b = sourceDiv === null || sourceDiv === void 0 ? void 0 : sourceDiv.lastChild) === null || _b === void 0 ? void 0 : _b.textContent;
            const timeParsed = timeAgo ? parse_duration_1.default(timeAgo) : undefined;
            const time = timeParsed
                ? dayjs_1.default().subtract(timeParsed, "ms")
                : undefined;
            return {
                id: url,
                title,
                url: url,
                description,
                image: Constants_1.Constants.bing.url + image,
                source: {
                    name: (sourceAnchor === null || sourceAnchor === void 0 ? void 0 : sourceAnchor.textContent) || undefined,
                    image: sourceImage
                        ? Constants_1.Constants.bing.url + sourceImage
                        : undefined,
                    url: sourceAnchorURL || undefined
                },
                time: time === null || time === void 0 ? void 0 : time.valueOf(),
                date: time === null || time === void 0 ? void 0 : time.format("YYYY-MM-DD")
            };
        });
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
    getEmbed(news) {
        return {
            title: news.title,
            url: news.url,
            image: {
                url: news.image
            },
            footer: {
                text: `Source: ${news.source.name}`,
                icon_url: news.source.image
            },
            timestamp: news.time ? new Date(news.time) : undefined
        };
    }
    getModel({ id, title, url, description, image, source: { name: sourceName, image: sourceImage }, time, date }) {
        const model = {
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
exports.BingManager = BingManager;
