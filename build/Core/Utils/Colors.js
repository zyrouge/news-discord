"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = exports.Color = void 0;
class Color {
    constructor(value) {
        this.value = value;
    }
    get num() {
        return typeof this.value === "number"
            ? this.value
            : parseInt(this.value.replace("#", ""), 16);
    }
    get hex() {
        return "#" + this.num.toString(16);
    }
    toString() {
        return this.hex;
    }
}
exports.Color = Color;
exports.Colors = {
    green: new Color(0x29ff19),
    red: new Color(0xff1919),
    blurple: new Color(0x7289da)
};
