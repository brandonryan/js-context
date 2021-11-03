import { isPlainObject, isValidKey } from "./utils.js";
let ShouldFreeze = true;
export function setShouldFreeze(val) {
    ShouldFreeze = Boolean(val);
}
/**
 * Returns an unfrozen child context so that values can be assigned
 * make sure to freeze this if ShouldFreeze is true before returning any child context
 */
export function makeChildContext(ctx) {
    return Object.create(ctx);
}
export class Context {
    constructor() {
        if (ShouldFreeze) {
            Object.freeze(this);
        }
    }
    with(keyOrValues, value) {
        const child = makeChildContext(this);
        //in this case, treat values object, only arg
        if (isPlainObject(keyOrValues)) {
            return deepAssignContext(child, keyOrValues);
        }
        if (!isValidKey(keyOrValues))
            throw new Error("Key must be a string, number, or symbol");
        //if value is an object we need to do deep merge assignment
        if (isPlainObject(value)) {
            return deepAssignContext(child, { [keyOrValues]: value });
        }
        assignContextValue(child, keyOrValues, value);
        if (ShouldFreeze) {
            Object.freeze(child);
        }
        return child;
    }
    //attaches a function to context, where the firts argument is always the current context.
    withCtxFunction(name, fn) {
        return this.with(name, function (...args) {
            return fn(this, ...args);
        });
    }
    //Builds a copy of the context's iterable properties as a plain object
    asObject() {
        const obj = {};
        for (const key in this) {
            if (this[key] instanceof Context) {
                const val = this[key].asObject();
                if (Object.keys(val).length > 0) { //only set if its not empty
                    obj[key] = val;
                }
            }
            else {
                obj[key] = this[key];
            }
        }
        return obj;
    }
}
//this ctx is assumed to be un-frozen
function deepAssignContext(ctx, src) {
    for (const [key, value] of Object.entries(src)) {
        //if its an object... https://tinyurl.com/ctxdeeper
        if (isPlainObject(value)) {
            const valueCtx = ctx[key] instanceof Context ?
                makeChildContext(ctx[key]) : //if the key on the context is a context, make it a child context.
                makeChildContext(new Context()); //otherwise, make it a new context child and shadow the value
            assignContextValue(ctx, key, deepAssignContext(valueCtx, value));
        }
        else {
            //just write the value and move on
            assignContextValue(ctx, key, value);
        }
    }
    //we need to manually assign any symbols
    for (const sym of Object.getOwnPropertySymbols(src)) {
        assignContextValue(ctx, sym, src[sym]);
    }
    //freeze on the way out because otherwise the nested contexts will not be frozen
    if (ShouldFreeze) {
        Object.freeze(ctx);
    }
    return ctx;
}
function assignContextValue(ctx, key, value) {
    //dont have to worry about _proto__ prototype injection because this will always assign the property properly
    Object.defineProperty(ctx, key, {
        enumerable: (typeof value === "function") ? false : true,
        value
    });
}
