export function isCdnURL(url: string) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
}