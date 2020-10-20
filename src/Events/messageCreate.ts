import * as NewsCore from "../Core";
import Eris from "eris";

export default new NewsCore.$Event(
    async (News: NewsCore.Client, message: Eris.Message) => {
        await News.commander.handleMessage(message);
    }
);
