import Eris from "eris";
export function bindPrototypes () {
    String.prototype.toProperCase = function () {
        return this.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    String.prototype.shorten = function (length: number, includeDots?: boolean) {
        const sliced = this.substr(0, length);
        return `${sliced}${sliced.length < this.length && includeDots ? "..." : ""}`;
    }

    Array.prototype.random = function () {
        return this[Math.floor(Math.random() * this.length)];
    }
}