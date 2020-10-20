export class Collection<K, V> extends Map<K, V> {
    constructor() {
        super();
    }

    toJSON() {
        return [...this.values()];
    }
}