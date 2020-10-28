const { default: axios } = require("axios");
const pkg = require("../package.json");
const chalk = require("chalk");
const semver = require("semver");
const _ = require("lodash");
const ora = require("ora");

const time = () => chalk.gray(new Date().toLocaleTimeString());

const LOG = (text, type = LOG) => console.log(`${time()} ${type} ${text}`);

const checkup = async () => {
    const checkingLog = ora({
        text: "Checking for updates",
        prefixText: time
    }).start();
    const { data: latestPkg } = await axios.get(
        "https://raw.githubusercontent.com/zyrouge/news-discord/build/package.json"
    );

    if (semver.lt(pkg.version, latestPkg.version)) {
        checkingLog.warn(
            `Update available! Latest: ${chalk.redBright(
                `v${latestPkg.version}`
            )} ${chalk.gray(
                `(${_.capitalize(semver.diff(pkg.version, latestPkg.version))})`
            )}`
        );
    } else checkingLog.succeed("Version up-to date");
};

checkup();
