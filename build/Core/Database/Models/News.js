"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsFactory = void 0;
const sequelize_1 = require("sequelize");
function NewsFactory(sequelize) {
    return sequelize.define("News", {
        id: {
            type: sequelize_1.DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        title: sequelize_1.DataTypes.STRING,
        url: sequelize_1.DataTypes.STRING,
        description: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        image: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        sourceName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        sourceImage: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        time: {
            type: sequelize_1.DataTypes.NUMBER,
            allowNull: true
        },
        date: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        }
    });
}
exports.NewsFactory = NewsFactory;
