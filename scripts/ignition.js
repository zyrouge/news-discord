const pkg = require("../package.json");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const semver = require("semver");
const _ = require("lodash");
const cp = require("child_process");

const INFO = chalk.cyanBright("INFO");
const ERROR = chalk.redBright("ERROR");
const WARN = chalk.yellowBright("WARN");
const SUCCESS = chalk.greenBright("SUCCESS");

const LOG = (text, type = "LOG") =>
    console.log(`[${chalk.rgb(114, 137, 218)("IGNITION")}] ${type} ${text}`);

const BASE = path.resolve(__dirname, "..");

const ignite = async () => {
    if (process.env.NODE_ENV !== "production")
        return LOG("Ignition can be used only in Producion mode!", ERROR);

    if (!fs.existsSync(path.join(BASE, "build")))
        return LOG("Build files does not exist!", ERROR);

    if (!fs.existsSync(path.join(BASE, "config.yaml")))
        return LOG("config.yaml does not exist!", ERROR);

    if (!fs.existsSync(path.join(BASE, ".env.production")))
        return LOG(".env.production does not exist!", ERROR);

    const { data: latestPkg } = await axios.default.get(
        "https://raw.githubusercontent.com/zyrouge/news-discord/build/package.json"
    );

    if (semver.lt(pkg.version, latestPkg.version))
        return LOG(
            `Update available! Latest: ${chalk.redBright(
                `v${latestPkg.version}`
            )} ${chalk.gray(
                `(${_.capitalize(semver.diff(pkg.version, latestPkg.version))})`
            )}`,
            WARN
        );

    LOG("Checkup passed", SUCCESS);
    LOG(`Starting bot from ${chalk.gray(pkg.main)}\n`, INFO);

    const child = cp.spawn("node", [pkg.main], {
        stdio: "inherit"
    });

    child.on("error", (err) => {
        LOG(err, ERROR);
    });

    child.on("exit", (code) => {
        LOG(`Process exited with code ${code}`, LOG);
        process.exit();
    });
};

ignite();
