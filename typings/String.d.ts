interface String {
    toProperCase: () => string;
    shorten: (length: number, includeDots?: boolean) => string;
}