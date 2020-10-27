const semver = require("semver");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const commandLineArgs = require("command-line-args");
const { execSync } = require("child_process");
const _ = require("lodash");
const inquirer = require("inquirer");

const pkgpath = path.resolve("package.json");
const pkg = require(pkgpath);

const options = [
    { name: "add", alias: "a", type: String, multiple: true },
    { name: "patch", type: Boolean },
    { name: "minor", type: Boolean },
    { name: "major", type: Boolean },
    { name: "nodocs", type: Boolean },
    { name: "nooutput", type: Boolean },
    {
        name: "message",
        alias: "m",
        type: String,
        multiple: true,
        defaultOption: true
    }
];

const info = chalk.cyanBright("INFO");
const warn = chalk.yellowBright("WARN");
const error = chalk.redBright("ERROR");

const exec = (cmd) => execSync(cmd, { stdio: "pipe" }).toString();

const update = async () => {
    const GitVersion = exec("git --version");
    const GitIsInstalled = GitVersion.trim().startsWith("git version");
    if (!GitIsInstalled) throw new Error("Git is not installed!");

    const args = commandLineArgs(options, { argv: process.argv });

    const showOutput = !args["nooutput"];
    if (!showOutput) console.log(`${warn} No outputs will be logged`);
    const Output = (text) => (showOutput && text ? console.log(text) : null);

    /* SemVer */
    let inc;
    if (args["patch"]) inc = "patch";
    else if (args["minor"]) inc = "minor";
    else if (args["major"]) inc = "major";

    let promptInc = !inc
        ? await inquirer.prompt([
              {
                  type: "list",
                  name: "inc",
                  message: "Select next Version:",
                  choices: ["Patch", "Minor", "Major"]
              }
          ])
        : null;

    if (promptInc) inc = promptInc.inc.toLowerCase();
    if (!inc) throw new Error("No semver update was received.");

    const prevVer = pkg.version;
    pkg.version = semver.inc(prevVer, inc);

    fs.writeFileSync(pkgpath, JSON.stringify(pkg, undefined, 4));
    console.log(
        `${info} ${chalk.blueBright(
            "[SemVer]"
        )} Version updated: ${chalk.bold.greenBright(
            prevVer
        )} -> ${chalk.bold.greenBright(pkg.version)} ${chalk.gray(
            `(${_.capitalize(inc)})`
        )}`
    );

    /* Generate Docs */
    const ignoreDocs = !!args["nodocs"];
    if (!ignoreDocs) {
        console.log(
            `${info} ${chalk.blueBright("[Docs]")} Generating Documentation`
        );
        const DocsOutput = exec("npm run docs");
        Output(chalk.gray(DocsOutput));
    }

    /* git add */
    const gitAdd = args["add"] ? args["add"].join(" ") : ".";
    console.log(
        `${info} ${chalk.blueBright(
            "[Files]"
        )} Git Add Files: ${chalk.greenBright(gitAdd)}`
    );
    const GitAddOutput = exec(`git add ${gitAdd}`);
    Output(chalk.gray(GitAddOutput));

    /* git commit */
    let gitCommit = args["message"];
    if (!gitCommit || !gitCommit.length)
        gitCommit = (
            (
                await inquirer.prompt([
                    {
                        type: "input",
                        name: "msg",
                        message: "Enter a Commit Message:"
                    }
                ])
            ).msg || "No information."
        ).split(" ");

    const changeLogs = exec(
        "git log --branches --not --remotes --no-decorate --oneline"
    );

    const commitMessage = [
        gitCommit.join(" "),
        "",
        "Changes:",
        changeLogs.split("\n")
    ];
    console.log(`${info} ${chalk.blueBright("[Commit]")} Git Commit Message:`);
    console.log(chalk.greenBright(commitMessage.join("\n")));

    const GitCommitOutput = exec(
        `git commit ${commitMessage.map((msg) => `-m "${msg}"`).join(" ")}`
    );
    Output(chalk.gray(GitCommitOutput));

    /* git push */
    console.log(`${info} ${chalk.blueBright("[Push]")} Pushing to GitHub`);
    const GitPushOutput = exec("git push");
    Output(chalk.gray(GitPushOutput));
};

try {
    update();
} catch (err) {
    console.log(`${error} ${err}`);
}
