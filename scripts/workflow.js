const fs = require("fs");

module.exports = (actionID, version, sha) => {
    fs.writeFileSync(
        "./README.md",
        [
            `# This is a automatic build of \`[bot](https://github.com/zyrouge/news-discord/tree/bot)\` branch using Github Actions`,
            `## Build Info"`,
            `* Action ID - \`${actionID}\``,
            `* Version - \`${version}\``,
            `* Commit SHA - \`${sha}\``
        ].join("\n")
    );
};
