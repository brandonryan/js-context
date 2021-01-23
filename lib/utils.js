export function isPlainObject(value) {
    const isObject = (value !== null && typeof value === 'object')
    if(!isObject) {
        return false
    }
    
    const isPlain = (Object.getPrototypeOf(value) === Object.prototype)
    return isPlain
}

export function isValidKey(k) {
    return typeof k === "string" || typeof k === "symbol"
}