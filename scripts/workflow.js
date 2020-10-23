const fs = require("fs");

module.exports = (actionID, version, sha, event) => {
    fs.writeFileSync(
        "./README.md",
        [
            `This is a automatic build of [\`bot\`](https://github.com/zyrouge/news-discord/tree/bot) branch using Github Actions`,
            `## Build Info`,
            `* Action ID - \`${actionID}\``,
            `* Event - \`${event}\``,
            `* Version - \`${version}\``,
            `* Commit SHA - \`${sha}\``
        ].join("\n")
    );
};
