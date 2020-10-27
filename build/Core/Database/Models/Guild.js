"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildFactory = void 0;
const sequelize_1 = require("sequelize");
function GuildFactory(sequelize) {
    return sequelize.define("Guild", {
        guildID: {
            primaryKey: true,
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        prefix: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        autoNewsChannel: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        bindToChannel: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        }
    });
}
exports.GuildFactory = GuildFactory;
