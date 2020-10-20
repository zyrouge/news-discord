import { Constants } from "../Constants";
import axios from "axios";
import Eris from "eris";
import turndown from "turndown";

export interface GuardianNews {
    id: string;
    type: string;
    sectionId: string;
    sectionName: string;
    webPublicationDate: string | Date;
    webTitle: string;
    webUrl: string;
    apiUrl: string;
    isHosted: boolean;
    pillarId: string;
    pillarName: string;
}

export interface GuardianExtendedNews extends GuardianNews {
    fields: {
        headline: string;
        body: string;
        thumbnail: string;
    }
}

export interface GuardianEdition {
    id: string;
    webTitle: string;
    webUrl: string;
    apiUrl: string;
    code: string;
}

export interface GuardianSection {
    id: string;
    webTitle: string;
    webUrl: string;
    apiUrl: string;
    editions: GuardianEdition[];
}

export class GuardianManager {
    private apiKey: string;
    cache: {
        news: {
            lastFetched?: number;
            cache: GuardianNews[];
            articles: GuardianExtendedNews[];
        }
        sections: {
            lastFetched?: number;
            cache: GuardianSection[];
        }
    }

    constructor(apiKey: string) {
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

    get(news: string | GuardianNews | GuardianExtendedNews) {
        const id = typeof news === "string" ? news : news.id;
        return (
            this.cache.news.cache.find(n => n.id === id) ||
            this.cache.news.articles.find(n => n.id === id)
        );
    }

    has(news: string | GuardianNews | GuardianExtendedNews) {
        return !!this.get(news);
    }

    async search(term: string) {
        const resp = await this.client.get("/search", {
            params: {
                q: `\"${encodeURIComponent(term)}\"`
            }
        });

        if(
            !resp.data.response ||
            resp.data.response.status !== "ok" ||
            !resp.data.response.results ||
            !resp.data.response.results.length
        ) throw new Error("Could not fetch News");

        const news: GuardianNews[] = resp.data.response.results;
        news.forEach(article => {
            if(!this.has(article.id)) this.cache.news.cache.push(article);
        });
        return news;
    }

    async fetch(id: string) {
        const cachedArticle = this.get(id);
        if(cachedArticle) return cachedArticle;

        const url = (id.startsWith("/") ? "" : "/") + id;
        const resp = await this.client.get(url, {
            params: {
                ["show-fields"]: [
                    "headline", "body", "thumbnail", "shouldHideAdverts=true"
                ].join(",")
            }
        });

        if(
            !resp.data.response ||
            resp.data.response.status !== "ok" ||
            !resp.data.response.content ||
            !resp.data.response.content.fields ||
            !resp.data.response.content.fields.headline ||
            !resp.data.response.content.fields.body ||
            !resp.data.response.content.fields.thumbnail
        ) throw new Error("Could not fetch News");

        const article: GuardianExtendedNews = resp.data.response.content;
        if(!this.has(article.id)) this.cache.news.articles.push(article);
        return article;
    }

    async sections() {
        if(
            this.cache.sections.cache &&
            this.cache.sections.cache.length > 0 &&
            this.cache.sections.lastFetched &&
            this.cache.sections.lastFetched - Date.now() < 1 * 60 * 60 * 1000
        ) return this.cache.sections.cache;

        const resp = await this.client.get("sections");
        
        if(
            !resp.data.response ||
            resp.data.response.status !== "ok" ||
            !resp.data.response.results ||
            !resp.data.response.results.length
        ) throw new Error("Could not fetch Sections");

        this.cache.sections.cache = resp.data.response.results as GuardianSection[];
        return this.cache.sections.cache;
    }

    getEmbed(news: GuardianNews | GuardianExtendedNews) {
        const embed = {
            title: news.webTitle,
            url: news.webUrl,
            timestamp: new Date(news.webPublicationDate),
            footer: {
                text: "Source: Guardian"
            }
        } as Eris.EmbedOptions;

        if("fields" in news) {
            embed.title = news.fields.headline;
            embed.description = new turndown().turndown(news.fields.body);
            embed.thumbnail = { url: news.fields.thumbnail };
        }
    
        return embed;
    }

    get client() {
        const instance = axios.create({
            baseURL: Constants.guardian.base
        });
        instance.defaults.params["api-key"] = this.apiKey;
        return instance;
    }
}