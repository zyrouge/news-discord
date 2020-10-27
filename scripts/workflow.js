const fs = require("fs");

module.exports = ({
    run_id,
    version,
    sha,
    event,
    pusher,
    github,
    owner,
    repo,
    changes
}) => {
    fs.appendFileSync(
        "./README.md",
        [
            `\n`,
            `## Production Code`,
            `This is a automatic build of [\`bot\`](https://github.com/zyrouge/news-discord/tree/bot) branch using Github Actions`,
            `## Build Info`,
            `* Runner ID - \`${run_id}\``,
            `* Event - \`${event}\``,
            `* Version - \`${version}\``,
            `* Commit SHA - \`${sha}\``,
            `* Pusher: \`${pusher.name}\``,
            `* Time of Built: **${new Date().toLocaleString("en-IN", {
                hour12: false
            })} (IST)**`
        ].join("\n")
    );
    console.log("Updated README.md");

    const tag = `v${version}`;
    github.repos.createRelease({
        owner,
        repo,
        tag_name: tag,
        body: changes[version] || "Unknown"
    });
    console.log(`Release created: ${tag}`);
};
