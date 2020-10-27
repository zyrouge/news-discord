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
exports.GuardianManager = void 0;
const Constants_1 = require("../Constants");
const axios_1 = __importDefault(require("axios"));
const turndown_1 = __importDefault(require("turndown"));
class GuardianManager {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.cache = {
            news: {
                cache: [],
                articles: []
            },
            sections: {
                cache: []
            }
        };
    }
    get(news) {
        const id = typeof news === "string" ? news : news.id;
        return (this.cache.news.cache.find((n) => n.id === id) ||
            this.cache.news.articles.find((n) => n.id === id));
    }
    has(news) {
        return !!this.get(news);
    }
    search(term) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.client.get("/search", {
                params: {
                    q: `\"${encodeURIComponent(term)}\"`
                }
            });
            if (!resp.data.response ||
                resp.data.response.status !== "ok" ||
                !resp.data.response.results ||
                !resp.data.response.results.length)
                throw new Error("Could not fetch News");
            const news = resp.data.response.results;
            news.forEach((article) => {
                if (!this.has(article.id))
                    this.cache.news.cache.push(article);
            });
            return news;
        });
    }
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedArticle = this.get(id);
            if (cachedArticle)
                return cachedArticle;
            const url = (id.startsWith("/") ? "" : "/") + id;
            const resp = yield this.client.get(url, {
                params: {
                    ["show-fields"]: [
                        "headline",
                        "body",
                        "thumbnail",
                        "shouldHideAdverts=true"
                    ].join(",")
                }
            });
            if (!resp.data.response ||
                resp.data.response.status !== "ok" ||
                !resp.data.response.content ||
                !resp.data.response.content.fields ||
                !resp.data.response.content.fields.headline ||
                !resp.data.response.content.fields.body ||
                !resp.data.response.content.fields.thumbnail)
                throw new Error("Could not fetch News");
            const article = resp.data.response.content;
            if (!this.has(article.id))
                this.cache.news.articles.push(article);
            return article;
        });
    }
    sections() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache.sections.cache &&
                this.cache.sections.cache.length > 0 &&
                this.cache.sections.lastFetched &&
                this.cache.sections.lastFetched - Date.now() < 1 * 60 * 60 * 1000)
                return this.cache.sections.cache;
            const resp = yield this.client.get("sections");
            if (!resp.data.response ||
                resp.data.response.status !== "ok" ||
                !resp.data.response.results ||
                !resp.data.response.results.length)
                throw new Error("Could not fetch Sections");
            this.cache.sections.cache = resp.data.response
                .results;
            return this.cache.sections.cache;
        });
    }
    getEmbed(news) {
        const embed = {
            title: news.webTitle,
            url: news.webUrl,
            timestamp: new Date(news.webPublicationDate),
            footer: {
                text: "Source: Guardian"
            }
        };
        if ("fields" in news) {
            embed.title = news.fields.headline;
            embed.description = new turndown_1.default().turndown(news.fields.body);
            embed.thumbnail = { url: news.fields.thumbnail };
        }
        return embed;
    }
    get client() {
        const instance = axios_1.default.create({
            baseURL: Constants_1.Constants.guardian.base
        });
        instance.defaults.params["api-key"] = this.apiKey;
        return instance;
    }
}
exports.GuardianManager = GuardianManager;
