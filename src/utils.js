export function isObject(value) {
    if(typeof value !== 'object') return false
    if(value === null) return false
    if(Array.isArray(value)) return false
    return true
}

export function isValidKey(k) {
    return typeof k === "string" || typeof k === "number" || typeof k === "symbol"
}