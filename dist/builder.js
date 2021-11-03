//TODO: make it obvious that you are dealing with a builder if you try to use it like a context
import { Context } from "./context.js";
import { isPlainObject, isValidKey } from "./utils.js";
//private variables
const priv = new WeakMap();
export class ContextBuilder {
    constructor() {
        priv.set(this, {});
    }
    with(key, value) {
        const values = priv.get(this);
        //in this case, treat key as values only arg
        if (isPlainObject(key) && value === undefined) {
            safegaurdKeys(this, key);
            deepAssign(values, key);
            return this;
        }
        if (!isValidKey(key)) {
            throw new Error("Key must be a string or symbol");
        }
        safegaurdKey(this, key, value);
        if (isPlainObject(value) && typeof key !== "symbol") {
            deepAssign(values, { [key]: value });
            return this;
        }
        values[key] = value;
        return this;
    }
    withCtxFunction(name, fn) {
        const values = priv.get(this);
        safegaurdKey(this, name, fn);
        //this cant be an arrow function
        values[name] = function (...args) { return fn(this, ...args); };
        return this;
    }
    asObject() {
        throw new Error(`Can not convert ${ContextBuilder.name} to object`);
    }
    build(ctx) {
        //if we get passed another ContextBuilder, we can make the destination inherit all the properties on this builder
        if (ctx instanceof ContextBuilder) {
            return ctx.with(priv.get(this));
        }
        if (!(ctx instanceof Context)) {
            throw new Error("ctx must be an instance of Context or ContextBuilder");
        }
        //assign our values
        const values = priv.get(this);
        return ctx.with(values);
    }
}
function deepAssign(dest, src) {
    for (const key in src) {
        if (isPlainObject(src[key])) {
            if (dest[key] === undefined) {
                dest[key] = {};
            }
            deepAssign(dest[key], src[key]);
        }
        else {
            dest[key] = src[key];
        }
    }
    //we need to manually assign any symbols
    for (const sym of Object.getOwnPropertySymbols(src)) {
        dest[sym] = src[sym];
    }
}
function safegaurdKeys(builder, obj) {
    for (const key in obj) {
        safegaurdKey(builder, key, obj[key]);
    }
}
function safegaurdKey(builder, key, value) {
    //we cant set the property if it is already defined
    if (builder.hasOwnProperty(key)) {
        return;
    }
    Object.defineProperty(builder, key, {
        enumerable: typeof value === "function" ? false : true,
        get: () => {
            throw new Error("ContextBuilder does not allow retrieving properties. build() the context first.");
        }
    });
}
