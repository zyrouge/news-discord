const semver = require("semver");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const pkgpath = path.resolve("package.json");
const pkg = require(pkgpath);

const update = async () => {
    let inc = "patch";
    if (process.argv.includes("--major")) inc = "major";
    else if (process.argv.includes("--major")) inc = "major";

    const prevVer = pkg.version;
    pkg.version = semver.inc(prevVer, inc);

    fs.writeFileSync(pkgpath, JSON.stringify(pkg, undefined, 4));
    console.log(
        `${chalk.blueBright(
            "[SemVer]"
        )} Version updated: ${chalk.bold.greenBright(
            prevVer
        )} -> ${chalk.bold.greenBright(pkg.version)}`
    );
};

update();
