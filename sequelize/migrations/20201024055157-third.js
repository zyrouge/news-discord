"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.addColumn("Guilds", "autoNewsTopic", {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.removeColumn("Guilds", "autoNewsTopic", {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        });
    }
};
