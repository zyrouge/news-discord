"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emojis = exports.Emoji = void 0;
class Emoji {
    constructor(emj) {
        const [animated, name, id] = emj.replace(/(<|>)/g, "").split(":");
        this.name = name;
        this.id = id;
        this.animated = animated === "a";
    }
    get url() {
        return `https://cdn.discordapp.com/emojis/${this.id}.png`;
    }
    toString() {
        return `<${this.animated ? "a" : ""}:${this.name}:${this.id}>`;
    }
}
exports.Emoji = Emoji;
exports.Emojis = {
    tick: new Emoji("<:greentick:697365161547268186>"),
    cross: new Emoji("<:redtick:697365222654214145>"),
    fire: "🔥",
    timer: "⏲️"
};
