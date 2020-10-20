import { Sequelize, Model, Optional, DataTypes } from "sequelize";

export interface GuildAttributes {
    guildID: string;
    prefix?: string;
    autoNewsChannel: string;
    bindToChannel: string;
    allowOutsideBound: boolean;
}

export interface GuildCreationAttributes
    extends Optional<GuildAttributes, "guildID"> {}

export interface GuildModel
    extends Model<GuildAttributes, GuildCreationAttributes> {}

export function GuildFactory(sequelize: Sequelize) {
    return sequelize.define<GuildModel>("Guild", {
        guildID: {
            primaryKey: true,
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        prefix: DataTypes.STRING,
        autoNewsChannel: DataTypes.STRING,
        bindToChannel: DataTypes.STRING,
        allowOutsideBound: DataTypes.BOOLEAN
    });
}
