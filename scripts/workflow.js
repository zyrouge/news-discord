const fs = require("fs");

module.exports = ({ run_id, version, sha, event, pusher }) => {
    fs.writeFileSync(
        "./README.md",
        [
            `# News Bot (Production Code)`,
            `This is a automatic build of [\`bot\`](https://github.com/zyrouge/news-discord/tree/bot) branch using Github Actions`,
            `## Build Info`,
            `* Runner ID - \`${run_id}\``,
            `* Event - \`${event}\``,
            `* Version - \`${version}\``,
            `* Commit SHA - \`${sha}\``,
            `* Pusher: \`${pusher.name}\``,
            `* Time of Built: **${new Date().toLocaleString()}**`
        ].join("\n")
    );
};
