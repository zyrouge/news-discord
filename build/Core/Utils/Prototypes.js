"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindPrototypes = void 0;
function bindPrototypes() {
    String.prototype.toProperCase = function () {
        return this.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };
    String.prototype.fromObjToSnakeCase = function () {
        return [...this]
            .map((x) => (x === x.toUpperCase() ? `_${x.toLowerCase()}` : x))
            .join("");
    };
    String.prototype.shorten = function (length, includeDots) {
        const sliced = this.substr(0, length);
        return `${sliced}${sliced.length < this.length && includeDots ? "..." : ""}`;
    };
    Array.prototype.random = function () {
        return this[Math.floor(Math.random() * this.length)];
    };
}
exports.bindPrototypes = bindPrototypes;
