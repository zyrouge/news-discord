const semver = require("semver");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const commandLineArgs = require("command-line-args");
const { execSync } = require("child_process");

const pkgpath = path.resolve("package.json");
const pkg = require(pkgpath);

const options = [
    { name: "add", alias: "a", type: String, multiple: true },
    { name: "minor", type: Boolean },
    { name: "major", type: Boolean },
    {
        name: "message",
        alias: "m",
        type: String,
        multiple: true,
        defaultOption: true
    }
];

const info = chalk.cyanBright("INFO");
const error = chalk.cyanBright("ERROR");

const update = async () => {
    const args = commandLineArgs(options, { argv: process.argv });

    /* SemVer */
    let inc = "patch";
    if (args["minor"]) inc = "minor";
    else if (args["major"]) inc = "major";

    const prevVer = pkg.version;
    pkg.version = semver.inc(prevVer, inc);

    fs.writeFileSync(pkgpath, JSON.stringify(pkg, undefined, 4));
    console.log(
        `${info} ${chalk.blueBright`[SemVer]`} Version updated: ${chalk.bold.greenBright(
            prevVer
        )} -> ${chalk.bold.greenBright(pkg.version)}`
    );

    /* git add */
    const gitAdd = args["add"] ? args["add"].join(" ") : ".";
    console.log(
        `${info} ${chalk.blueBright`[Files]`} Git Add Files: ${chalk.gray(
            gitAdd
        )}`
    );
    execSync(`git add ${gitAdd}`);

    /* git commit */
    const gitCommit = args["message"];
    if (!gitCommit || !gitCommit.length) {
        console.log(
            `${error} ${chalk.blueBright`[Commit]`} No Commit Message was provided`
        );
        process.exit();
    }
    console.log(
        `${info} ${chalk.blueBright`[Files]`} Git Commit Message: ${chalk.gray(
            gitCommit.join(" ")
        )}`
    );
    execSync(`git commit -m "${gitCommit.join(" ")}"`);

    /* git push */
    console.log(`${info} ${chalk.blueBright`[Push]`} Pushing to GitHub`);
    execSync(`git push`);
};

update();
