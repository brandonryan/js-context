export function isPlainObject(value) {
    if (typeof value !== 'object')
        return false;
    if (value === null)
        return false;
    if (Object.getPrototypeOf(value) !== Object.prototype)
        return false;
    return true;
}
export function isValidKey(k) {
    return typeof k === "string" || typeof k === "number" || typeof k === "symbol";
}
