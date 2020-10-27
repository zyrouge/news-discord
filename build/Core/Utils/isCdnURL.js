"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCdnURL = void 0;
function isCdnURL(url) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
}
exports.isCdnURL = isCdnURL;
