"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permissions = exports.Level = void 0;
const eris_1 = __importDefault(require("eris"));
class Level {
    constructor(name, level, condition) {
        this.name = name;
        this.level = level;
        this.condition = condition;
    }
}
exports.Level = Level;
class Permissions {
    constructor(News) {
        this.News = News;
        this.perms = Object.keys(eris_1.default.Constants.Permissions);
    }
    getPerms(member) {
        return Object.entries(member.permission.json).filter(p => p[1] === true).map(p => p[0]);
    }
}
exports.Permissions = Permissions;
