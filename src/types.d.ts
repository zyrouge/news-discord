interface Array<T> {
    random: () => T;
}

interface String {
    toProperCase: () => string;
    fromObjToSnakeCase: () => string;
    shorten: (length: number, includeDots?: boolean) => string;
}
