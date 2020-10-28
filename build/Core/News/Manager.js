"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsManager = void 0;
const Guardian_1 = require("./Guardian");
const Bing_1 = require("./Bing");
const Reddit_1 = require("./Reddit");
class NewsManager {
    constructor(options) {
        this.Guardian = new Guardian_1.GuardianManager(options.guardianKey);
        this.Bing = new Bing_1.BingManager({
            updateInterval: 10 * 60 * 1000
        });
        this.Reddit = new Reddit_1.RedditManager();
    }
}
exports.NewsManager = NewsManager;
