export class Emoji {
    name: string;
    id: string;
    animated: boolean;

    constructor(emj: string) {
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

export const Emojis = {
    tick: new Emoji("<:greentick:697365161547268186>"),
    cross: new Emoji("<:redtick:697365222654214145>"),
    fire: "🔥"
};
