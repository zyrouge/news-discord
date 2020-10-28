import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import Ora from "ora";
import logSymbols from "log-symbols";

const { success, error, warning, info } = logSymbols;

const LogsDir = path.resolve(
    "logs",
    (process.env.NODE_ENV || "unknown").toUpperCase(),
    new Date().toLocaleDateString().replace(/\//g, "-")
);
fs.ensureDirSync(LogsDir);

export const LogFileDir = {
    main: "main.log",
    log: "info.log",
    debug: "debug.log",
    warn: "warn.log",
    error: "error.log"
};

export class LogWriter {
    stream: fs.WriteStream;

    constructor(dir: string) {
        this.stream = fs.createWriteStream(dir, { flags: "a" });
    }

    write(msg: string) {
        this.stream.write(
            `\n${this.time} - ${msg.replace(/[^a-zA-Z0-9 ]/g, "")}`
        );
    }

    get time() {
        return new Date().toLocaleTimeString();
    }
}

export const LogFiler: {
    [s: string]: LogWriter;
} = {};

Object.entries(LogFileDir).forEach(([meth, dirF]) => {
    var dir = path.join(LogsDir, `${dirF}`);
    fs.ensureFileSync(dir);
    LogFiler[meth] = new LogWriter(dir);
});

export class Logger {
    static main(msg: string) {
        LogFiler["main"]?.write(msg);
        console.log(`${this.time} ${success} ${msg}`);
    }

    static log(msg: string) {
        LogFiler["log"]?.write(msg);
        console.log(`${this.time} ${info} ${msg}`);
    }

    static debug(msg: string) {
        LogFiler["debug"]?.write(msg);
        console.log(`${this.time} ${info} ${msg}`);
    }

    static warn(msg: string) {
        LogFiler["warn"]?.write(msg);
        console.log(`${this.time} ${warning} ${msg}`);
    }

    static error(msg: string) {
        LogFiler["error"]?.write(msg);
        console.log(`${this.time} ${error} ${msg}`);
    }

    static get time() {
        return chalk.grey(new Date().toLocaleTimeString());
    }

    static get chalk() {
        return chalk;
    }

    static get Ora() {
        return Ora;
    }

    static get symbols() {
        return logSymbols;
    }
}
