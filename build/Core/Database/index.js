"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const sequelize_1 = require("sequelize");
const Logger_1 = require("../Utils/Logger");
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
/* Models */
const Guild_1 = require("./Models/Guild");
const News_1 = require("./Models/News");
class DatabaseManager {
    constructor(dir, name) {
        fs_extra_1.ensureDirSync(dir);
        const fullPath = path_1.default.join(dir, name);
        fs_extra_1.ensureFileSync(fullPath);
        this.Sequelize = new sequelize_1.Sequelize({
            dialect: "sqlite",
            storage: fullPath,
            logging: false
        });
        this.Guild = Guild_1.GuildFactory(this.Sequelize);
        this.News = News_1.NewsFactory(this.Sequelize);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Sequelize.sync();
            Logger_1.Logger.log("Database connected");
        });
    }
}
exports.DatabaseManager = DatabaseManager;
