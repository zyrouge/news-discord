import Eris from "eris";
import { CommandHandler } from "./Command";
import { $Event } from "./Event";
import { NewsManager } from "./News";
import { DatabaseManager } from "./Database";
import { Logger, Permissions } from "./Utils";
import { CronJobs } from "./Utils/CronJobs";
import { promises as fs } from "fs";
import path from "path";

export interface ClientOptions {
    commands: string;
    events: string;
    eris?: Eris.ClientOptions;
    config: Config;
}

export interface Config {
    owners: string[];
    prefix: string;
    server: {
        invite: string;
        id: string;
    };
}

export class ClientUtils {
    News: Client;
    Permissions: Permissions;

    constructor(News: Client) {
        this.News = News;
        this.Permissions = new Permissions(News);
    }

    clean(text: string) {
        const token = this.News.bot.token || "token";
        return text.replace(
            new RegExp(token, "g"),
            Buffer.from(this.News.bot.user.id).toString("base64") +
                new Array(30)
                    .fill(null)
                    .map(() =>
                        String.fromCharCode(
                            Math.floor(Math.random() * (122 - 35)) + 35
                        )
                    )
                    .join("")
        );
    }
}

export class Client {
    bot: Eris.Client;
    options: ClientOptions;
    commander: CommandHandler;
    Database: DatabaseManager;
    Utils: ClientUtils;
    NewsManager: NewsManager;
    CronJobs: CronJobs;

    constructor(token: string, options: ClientOptions) {
        this.bot = new Eris.Client(token, options?.eris);
        this.options = options;
        this.commander = new CommandHandler(this);

        if (!process.env.GUARDIAN_API)
            throw new Error("'GUARDIAN_API' was not found in '.env'");
        this.NewsManager = new NewsManager({
            guardianKey: process.env.GUARDIAN_API
        });

        if (!process.env.DATABASE_PATH)
            throw new Error("'DATABASE_PATH' was not found in '.env'");
        if (!process.env.DATABASE_NAME)
            throw new Error("'DATABASE_NAME' was not found in '.env'");

        this.Database = new DatabaseManager(
            process.env.DATABASE_PATH,
            process.env.DATABASE_NAME + ".sqlite"
        );

        this.Utils = new ClientUtils(this);
        this.CronJobs = new CronJobs(this, 5);
    }

    async initialize() {
        Logger.log(
            `Loading Events from ${Logger.chalk.underline(this.options.events)}`
        );
        const eventFiles = await fs.readdir(this.options.events);
        for (const file of eventFiles) {
            const name = file.split(".")[0];
            const event: $Event = require(path.join(this.options.events, file))
                .default;
            this.bot.on(name, (...args: any) => event.execute(this, ...args));
            Logger.debug(`Event loaded: ${Logger.chalk.underline(file)}`);
        }

        Logger.log(
            `Loading Commands from ${Logger.chalk.underline(
                this.options.events
            )}`
        );
        const commandFiles = await fs.readdir(this.options.commands);
        for (const file of commandFiles) {
            this.commander.load(file);
            Logger.debug(
                `Command loaded: ${Logger.chalk.underline(file.split(".")[0])}`
            );
        }
    }

    async finalize() {
        await this.bot.connect();
        await this.Database.connect();
        await this.NewsManager.Bing.headlines();
        await this.CronJobs.start();
        return;
    }

    async destroy() {
        await this.bot.disconnect({ reconnect: false });
        return;
    }
}
