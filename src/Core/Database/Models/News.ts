import { Sequelize, Model, Optional, DataTypes } from "sequelize";

export interface NewsAttributes {
    id: string;
    title: string;
    url: string;
    description?: string | null;
    image?: string | null;
    sourceName?: string | null;
    sourceImage?: string | null;
    time?: number | null;
    date?: string | null;
}

export interface NewsCreationAttributes
    extends Optional<NewsAttributes, "id"> {}

export interface NewsModel
    extends Model<NewsAttributes, NewsCreationAttributes> {}

export function NewsFactory(sequelize: Sequelize) {
    return sequelize.define<NewsModel>("News", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        title: DataTypes.STRING,
        url: DataTypes.STRING,
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sourceName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sourceImage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        time: {
            type: DataTypes.NUMBER,
            allowNull: true
        },
        date: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
}
