const semver = require("semver");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const commandLineArgs = require("command-line-args");
const { exec: ExecuteCommand } = require("child_process");
const _ = require("lodash");
const inquirer = require("inquirer");
const simpleGit = require("simple-git");

const pkgpath = path.resolve("package.json");
const pkg = require(pkgpath);
const git = simpleGit();

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
const util = require("util");

const info = chalk.cyanBright("INFO");
const warn = chalk.yellowBright("WARN");
const error = chalk.redBright("ERROR");

const exec = (cmd) =>
    new Promise(async (resolve, reject) => {
        const exe = util.promisify(ExecuteCommand);
        const { stdout, stderr } = await exe(cmd);
        resolve(stdout);
        reject(stderr);
    });

const update = async () => {
    const GitVersion = await exec("git --version");
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

    /* Changelogs */
    const changes = (
        await inquirer.prompt([
            {
                type: "editor",
                message: "Write about the Changes:",
                name: "changes"
            }
        ])
    ).changes;

    const changeLogsDir = path.resolve("changelogs.md");
    fs.ensureFileSync(changeLogsDir);
    fs.appendFileSync(changeLogsDir, `# v${pkg.version}\n${changes}`);

    /* Generate Docs */
    const ignoreDocs = !!args["nodocs"];
    if (!ignoreDocs) {
        console.log(
            `${info} ${chalk.blueBright("[Docs]")} Generating Documentation`
        );
        const DocsOutput = await exec("npm run docs");
        Output(chalk.gray(DocsOutput));
    }

    /* Changelogs JSON */
    const changeLogsJSONDir = path.resolve("docs", "changelogs.json");
    fs.ensureFileSync(changeLogsJSONDir);
    let changeLogsJSON = fs.readFileSync(changeLogsJSONDir).toString();
    if (!changeLogsJSON) changeLogsJSON = {};
    changeLogsJSON[pkg.version] = {
        version: pkg.version,
        semver: `v${pkg.version}`,
        changes: changes
    };
    fs.writeFileSync(
        changeLogsJSONDir,
        JSON.stringify(changeLogsJSON, null, 4)
    );

    /* git add */
    const gitAdd = args["add"] ? args["add"].join(" ") : ".";
    console.log(
        `${info} ${chalk.blueBright(
            "[Files]"
        )} Git Add Files: ${chalk.greenBright(gitAdd)}`
    );
    const GitAddOutput = await git.add(gitAdd);
    Output(chalk.gray(GitAddOutput));

    /* git commit */
    let gitCommit = args["message"] ? args["message"].join(" ") : null;
    if (!gitCommit || !gitCommit.length) gitCommit = changes;

    console.log(`${info} ${chalk.blueBright("[Commit]")} Git Commit Message:`);
    console.log(chalk.greenBright(changes));

    const GitCommitOutput = await git.commit(changes);
    Output(chalk.gray(GitCommitOutput));

    /* git push */
    console.log(`${info} ${chalk.blueBright("[Push]")} Pushing to GitHub`);
    const GitPushOutput = await git.push("npm run git:push");
    Output(chalk.gray(GitPushOutput));
};

try {
    update();
} catch (err) {
    console.log(`${error} ${err}`);
}
