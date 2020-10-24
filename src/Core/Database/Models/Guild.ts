import { Sequelize, Model, Optional, DataTypes } from "sequelize";

export interface GuildAttributes {
    guildID: string;
    prefix?: string | null;
    autoNewsChannel?: string | null;
    autoNewsTopic?: string | null;
    bindToChannel?: string | null;
    allowOutsideBound?: boolean | null;
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
        prefix: {
            type: DataTypes.STRING,
            allowNull: true
        },
        autoNewsChannel: {
            type: DataTypes.STRING,
            allowNull: true
        },
        autoNewsTopic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bindToChannel: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
}
