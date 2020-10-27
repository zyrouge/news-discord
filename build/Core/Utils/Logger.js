"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogFiler = exports.LogWriter = exports.LogFileDir = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const LogsDir = path_1.default.resolve("logs", (process.env.NODE_ENV || "unknown").toUpperCase(), new Date().toLocaleDateString().replace(/\//g, "-"));
fs_extra_1.default.ensureDirSync(LogsDir);
exports.LogFileDir = {
    main: "main.log",
    log: "info.log",
    debug: "debug.log",
    warn: "warn.log",
    error: "error.log"
};
class LogWriter {
    constructor(dir) {
        this.stream = fs_extra_1.default.createWriteStream(dir, { flags: "a" });
    }
    write(msg) {
        this.stream.write(`\n${this.time} - ${msg.replace(/[^a-zA-Z0-9 ]/g, "")}`);
    }
    get time() {
        return new Date().toLocaleTimeString();
    }
}
exports.LogWriter = LogWriter;
exports.LogFiler = {};
Object.entries(exports.LogFileDir).forEach(([meth, dirF]) => {
    var dir = path_1.default.join(LogsDir, `${dirF}`);
    fs_extra_1.default.ensureFileSync(dir);
    exports.LogFiler[meth] = new LogWriter(dir);
});
class Logger {
    static main(msg) {
        var _a;
        (_a = exports.LogFiler["main"]) === null || _a === void 0 ? void 0 : _a.write(msg);
        console.log(`${this.time} # ${chalk_1.default.greenBright("MAIN")} > ${msg}`);
    }
    static log(msg) {
        var _a;
        (_a = exports.LogFiler["log"]) === null || _a === void 0 ? void 0 : _a.write(msg);
        console.log(`${this.time} # ${chalk_1.default.cyanBright("INFO")} > ${msg}`);
    }
    static debug(msg) {
        var _a;
        (_a = exports.LogFiler["debug"]) === null || _a === void 0 ? void 0 : _a.write(msg);
        console.log(`${this.time} # ${chalk_1.default.blueBright("DBUG")} > ${msg}`);
    }
    static warn(msg) {
        var _a;
        (_a = exports.LogFiler["warn"]) === null || _a === void 0 ? void 0 : _a.write(msg);
        console.log(`${this.time} # ${chalk_1.default.yellowBright("WARN")} > ${msg}`);
    }
    static error(msg) {
        var _a;
        (_a = exports.LogFiler["error"]) === null || _a === void 0 ? void 0 : _a.write(msg);
        console.log(`${this.time} # ${chalk_1.default.redBright("ERR!")} > ${msg}`);
    }
    static get time() {
        return chalk_1.default.grey(new Date().toLocaleString());
    }
    static get chalk() {
        return chalk_1.default;
    }
}
exports.Logger = Logger;
