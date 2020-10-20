import axios from "axios";
import Eris from "eris";
import { Constants } from "../Constants";
import { isCdnURL } from "../Utils/isCdnURL";
const UserAgents: string[] = require("../../../data/userAgents.json");

export interface RedditArticle {
    id: string;
    name: string;
    text: string;
    subreddit: string;
    url: string;
    image?: string;
    likes: number;
    dislikes: number;
    nsfw: boolean;
}

export class RedditManager {
    cache: RedditArticle[];

    constructor() {
        this.cache = [];
    }

    get(id: string) {
        return this.cache.find((n) => n.id === id);
    }

    has(id: string) {
        return !!this.get(id);
    }

    async fetch(nsfw: boolean = false) {
        const subreddit = this.reddits.random();
        const category = this.categories.random();
        const url = `/r/${subreddit}/${category}`;
        const resp = await this.client.get(url);

        if (!resp.data) throw new Error("No Content was found");

        const listing = Array.isArray(resp.data)
            ? resp.data[0].data
            : typeof resp.data === "object"
            ? resp.data.data
            : undefined;
        if (!listing) throw new Error("No Listing was found.");

        const post = listing.children[0] ? listing.children[0].data : false;
        if (!post) throw new Error("No Post was found.");

        if (post.over_18 && !nsfw) throw new Error("NSFW Post");

        if (!post.title || !post.selftext) throw new Error("No Post was found");

        const article: RedditArticle = {
            id: post.permalink,
            name: post.title,
            text: post.selftext,
            subreddit,
            url: `https://reddit.com${post.permalink}`,
            image: post.url && isCdnURL(post.url) ? post.url : undefined,
            likes: post.ups || 0,
            dislikes: post.downs || 0,
            nsfw: Boolean(post.over_18)
        };

        if (!this.has(article.id)) this.cache.push(article);
        return article;
    }

    random() {
        return this.cache.random();
    }

    getEmbed(article: RedditArticle) {
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
        } as Eris.EmbedOptions;
    }

    get client() {
        const instance = axios.create({
            url: Constants.reddit.base,
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
