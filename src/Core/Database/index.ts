import { Sequelize } from "sequelize";
import { Logger } from "../Utils/Logger";
import { ensureDirSync, ensureFileSync } from "fs-extra";
import path from "path";

/* Models */
import { GuildFactory } from "./Models/Guild";
import { NewsFactory } from "./Models/News";

export class DatabaseManager {
    Sequelize: Sequelize;
    Guild: ReturnType<typeof GuildFactory>;
    News: ReturnType<typeof NewsFactory>;

    constructor(dir: string, name: string) {
        ensureDirSync(dir);
        const fullPath = path.join(dir, name);
        ensureFileSync(fullPath);

        this.Sequelize = new Sequelize({
            dialect: "sqlite",
            storage: fullPath,
            logging: false
        });

        this.Guild = GuildFactory(this.Sequelize);
        this.News = NewsFactory(this.Sequelize);
    }

    async connect() {
        await this.Sequelize.sync();
        Logger.log("Database connected");
    }
}
