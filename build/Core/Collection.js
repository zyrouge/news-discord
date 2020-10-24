"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
class Collection extends Map {
    constructor() {
        super();
    }
    toJSON() {
        return [...this.values()];
    }
}
exports.Collection = Collection;
