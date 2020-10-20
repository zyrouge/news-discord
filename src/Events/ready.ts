import * as NewsCore from "../Core";

export default new NewsCore.$Event((News: NewsCore.Client) => {
    NewsCore.Utils.Logger.main(
        `Logged in as ${NewsCore.Utils.Logger.chalk.underline(
            `${News.bot.user.username}#${News.bot.user.discriminator}`
        )}`
    );
});
