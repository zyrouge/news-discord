import { GuardianManager } from "./Guardian";
import { BingManager } from "./Bing";
import { RedditManager } from "./Reddit";

export interface NewsManagerOptions {
    guardianKey: string;
}

export class NewsManager {
    Guardian: GuardianManager;
    Bing: BingManager;
    Reddit: RedditManager;

    constructor(options: NewsManagerOptions) {
        this.Guardian = new GuardianManager(options.guardianKey);
        this.Bing = new BingManager({
            updateInterval: 10 * 60 * 1000
        });
        this.Reddit = new RedditManager();
    }
}