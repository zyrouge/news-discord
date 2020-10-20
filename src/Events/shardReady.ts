import * as NewsCore from "../Core";

export default new NewsCore.$Event((News: NewsCore.Client, shardID: number) => {
    News.bot.shards.get(shardID)?.editStatus("online", {
        name: `News • ${News.options.config.prefix}help • Shard ${shardID} in ${News.bot.shards.size}`,
        type: 3,
    });
});
