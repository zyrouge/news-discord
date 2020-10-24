const path = require("path");
const root = path.join(process.cwd(), "..", "database");

module.exports = {
    development: {
        storage: path.join(root, "development.sqlite"),
        dialect: "sqlite"
    },
    production: {
        storage: path.join(root, "production.sqlite"),
        dialect: "sqlite"
    }
};
