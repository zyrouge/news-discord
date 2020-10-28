const semver = require("semver");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const logSymbols = require("log-symbols");
const { exec: ExecuteCommand } = require("child_process");
const _ = require("lodash");
const inquirer = require("inquirer");
const simpleGit = require("simple-git");
const Ora = require("ora");
const util = require("util");

const pkgpath = path.resolve("package.json");
const pkg = require(pkgpath);
const git = simpleGit();

const exec = (cmd) =>
    new Promise(async (resolve, reject) => {
        const exe = util.promisify(ExecuteCommand);
        const { stdout, stderr } = await exe(cmd);
        resolve(stdout);
        reject(stderr);
    });

const update = async () => {
    const GitCheckLog = Ora("Checking for Git").start();
    const GitVersion = await exec("git --version");
    const GitIsInstalled = GitVersion.trim().startsWith("git version");
    if (!GitIsInstalled) return GitCheckLog.fail("Git is not installed");
    else GitCheckLog.succeed("Git is installed");

    /* SemVer */
    const { inc } = await inquirer.prompt([
        {
            type: "list",
            name: "inc",
            message: "Select next Version:",
            choices: ["Patch", "Minor", "Major"]
        }
    ]);

    const prevVer = pkg.version;
    pkg.version = semver.inc(prevVer, inc.toLowerCase());

    console.log(
        `${logSymbols.info} Version updated: ${chalk.bold.greenBright(
            prevVer
        )} -> ${chalk.bold.greenBright(pkg.version)} ${chalk.gray(
            `(${_.capitalize(inc)})`
        )}`
    );

    const pkgVersionLog = Ora("Writing version to package.json").start();
    await fs
        .writeFile(pkgpath, JSON.stringify(pkg, undefined, 4))
        .catch((err) => {
            return pkgVersionLog.fail(
                `Could not update package.json: ${chalk.redBright(err)}`
            );
        });
    pkgVersionLog.succeed("Updated package.json");

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

    const changeLogsLog = Ora("Writing changes to changelog.md").start();
    const changeLogsDir = path.resolve("changelog.md");
    await fs.ensureFile(changeLogsDir);

    const prevChangeLogsMD = await fs.readFile(changeLogsDir);
    await fs
        .writeFile(
            changeLogsDir,
            `${prevChangeLogsMD}\n# v${pkg.version}\n${changes}\n`
        )
        .catch((err) => {
            return changeLogsLog.fail(
                `Could not update changelog.md: ${chalk.redBright(err)}`
            );
        });
    changeLogsLog.succeed("Updated changelog.md");

    /* Changelogs JSON */
    const changeLogsJSONLog = Ora("Writing changes to changelog.json").start();
    const changeLogsJSONDir = path.resolve("data", "changelog.json");
    await fs.ensureFile(changeLogsJSONDir);
    let changeLogsJSON = fs.readFileSync(changeLogsJSONDir).toString();
    changeLogsJSON = changeLogsJSON.length ? JSON.parse(changeLogsJSON) : {};
    changeLogsJSON[pkg.version] = {
        version: pkg.version,
        semver: `v${pkg.version}`,
        changes: changes
    };
    await fs
        .writeFile(changeLogsJSONDir, JSON.stringify(changeLogsJSON, null, 4))
        .catch((err) => {
            return changeLogsJSONLog.fail(
                `Could not update changelog.json: ${chalk.redBright(err)}`
            );
        });
    changeLogsJSONLog.succeed("Updated changelog.json");

    /* Generate Docs */
    if (!process.argv.includes("--no-docs")) {
        const denDocsLog = Ora("Generating Documentation");
        denDocsLog.start();
        await exec("npm run docs").catch((err) => {
            return denDocsLog.fail(
                `Could not generate Documentation: ${chalk.redBright(err)}`
            );
        });
        await fs.createFile(path.resolve("docs", ".nojekyll"));
        denDocsLog.succeed("Documentation generated");
    } else
        console.log(
            `${logSymbols.warning} Skipping Documentation: ${chalk.redBright(
                "--nodocs"
            )}`
        );

    /* git add */
    const gitLog = Ora("Adding files to commit").start();
    await git.add(".").catch((err) => {
        return gitLog.fail(
            `Could not add files to git: ${chalk.redBright(err)}`
        );
    });

    /* git commit */
    gitLog.text = "Committing the changes";
    await git.commit(changes).catch((err) => {
        return gitLog.fail(
            `Could not commit the changes: ${chalk.redBright(err)}`
        );
    });
    gitLog.succeed("Registered the changes");

    /* git push */
    const { push } = await inquirer.prompt([
        {
            type: "confirm",
            message: "Push to GitHub?",
            name: "push"
        }
    ]);

    if (!push)
        return console.log(
            `${logSymbols.warning} Pushing to Github was aborted`
        );

    const gitPushLog = Ora("Pushing to GitHub").start();
    await git.push().catch((err) => {
        return gitPushLog.fail(
            `Could not push the changes: ${chalk.redBright(err)}`
        );
    });
    gitPushLog.succeed("Pushed to GitHub");

    process.exit();
};

try {
    update();
} catch (err) {
    console.log(`${logSymbols.error} ${chalk.redBright(err)}`);
}
