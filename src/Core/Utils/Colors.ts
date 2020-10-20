export class Color {
    value: number | string;

    constructor(value: number | string) {
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

export const Colors = {
    green: new Color(0x29ff19),
    red: new Color(0xff1919),
    blurple: new Color(0x7289da)
};
