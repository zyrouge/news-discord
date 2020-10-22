interface String {
    toProperCase: () => string;
    fromObjToSnakeCase: () => string;
    shorten: (length: number, includeDots?: boolean) => string;
}
