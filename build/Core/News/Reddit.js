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
exports.RedditManager = void 0;
const axios_1 = __importDefault(require("axios"));
const Constants_1 = require("../Constants");
const isCdnURL_1 = require("../Utils/isCdnURL");
const UserAgents = require("../../../data/userAgents.json");
class RedditManager {
    constructor() {
        this.cache = [];
    }
    get(id) {
        return this.cache.find((n) => n.id === id);
    }
    has(id) {
        return !!this.get(id);
    }
    fetch(nsfw = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const subreddit = this.reddits.random();
            const category = this.categories.random();
            const url = `/r/${subreddit}/${category}`;
            const resp = yield this.client.get(url);
            if (!resp.data)
                throw new Error("No Content was found");
            const listing = Array.isArray(resp.data)
                ? resp.data[0].data
                : typeof resp.data === "object"
                    ? resp.data.data
                    : undefined;
            if (!listing)
                throw new Error("No Listing was found.");
            const post = listing.children[0] ? listing.children[0].data : false;
            if (!post)
                throw new Error("No Post was found.");
            if (post.over_18 && !nsfw)
                throw new Error("NSFW Post");
            if (!post.title || !post.selftext)
                throw new Error("No Post was found");
            const article = {
                id: post.permalink,
                name: post.title,
                text: post.selftext,
                subreddit,
                url: `https://reddit.com${post.permalink}`,
                image: post.url && isCdnURL_1.isCdnURL(post.url) ? post.url : undefined,
                likes: post.ups || 0,
                dislikes: post.downs || 0,
                nsfw: Boolean(post.over_18)
            };
            if (!this.has(article.id))
                this.cache.push(article);
            return article;
        });
    }
    random() {
        return this.cache.random();
    }
    getEmbed(article) {
        return {
            title: article.name,
            description: article.text,
            url: article.url,
            thumbnail: {
                url: article.image
            },
            footer: {
                text: `Source: r/${article.subreddit} | 👍 ${article.likes} | 👎 ${article.dislikes}`
            }
        };
    }
    get client() {
        const instance = axios_1.default.create({
            url: Constants_1.Constants.reddit.base,
            headers: {
                ["User-Agent"]: UserAgents.random()
            }
        });
        return instance;
    }
    get reddits() {
        return ["worldnews", "news"];
    }
    get categories() {
        return ["hot", "random"];
    }
}
exports.RedditManager = RedditManager;
