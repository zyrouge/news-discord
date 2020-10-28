import * as NewsCore from "./Core";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import yaml from "yaml";
import { bindPrototypes } from "./Core/Utils/Prototypes";

if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: path.join(__dirname, "..", ".env.production") });
} else if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: path.join(__dirname, "..", ".env.development") });
}

bindPrototypes();
if (!process.env.DISCORD_TOKEN)
    throw new Error("'DISCORD_TOKEN' was not found in '.env'");

NewsCore.Utils.Logger.main(
    `Environment: ${NewsCore.Utils.Logger.chalk.underline(
        (process.env.NODE_ENV || "unknown").toProperCase()
    )}`
);

const config: NewsCore.Config = yaml.parse(
    fs.readFileSync(path.resolve("config.yaml"), "utf8")
);
const News = new NewsCore.Client(process.env.DISCORD_TOKEN, {
    commands: __dirname + "/Commands",
    events: __dirname + "/Events",
    config,
    eris: {
        defaultImageFormat: "png",
        defaultImageSize: 1024,
        disableEvents: {
            TYPING_START: false
        },
        maxShards: "auto",
        allowedMentions: {
            everyone: false
        }
    }
});

const init = async () => {
    NewsCore.Utils.Logger.main("Initializing...");
    await News.initialize();
    NewsCore.Utils.Logger.main("Finalizing...");
    await News.finalize();
};

init();
