const { makeChildContext, Context } = require("./context")

//private variables
const priv = new WeakMap()

export class ContextBuilder {
    constructor() {
        priv.set(this, {})
    }

    with(key, value) {
        const values = priv.get(this)

        //in this case, treat key as values only arg
        if(Object.getPrototypeOf(key) === Object) {
            deepAssign(values, key)
        } else {
            values[key] = value
        }
        
        return this
    }

    withCtxFunction(name, fn) {
        const values = priv.get(this)
        //this cant be an arrow function
        values[name] = function (...args) { return fn(this, ...args) }
        return this
    }

    build(ctx) {
        //if we get passed another ContextBuilder, we can "merge" the two
        if(ctx instanceof ContextBuilder) {
            return inheritBuild(ctx, this)
        }
        
        if(!(ctx instanceof Context)) {
            throw new Error("ctx must be an instance of Context")
        }

        //assign our values
        const {values} = priv.get(this)
        return makeChildContext(ctx).with(values)
    }
}

function inheritBuild(dest, src) {
    dest = priv.get(dest)
    src = priv.get(src)

    deepAssign(dest.values, src.values)
    Object.assign(dest.functions, src.functions)
    return dest
}

function deepAssign(dest, src) {
    for(const key in src) {
        if(Object.getPrototypeOf(src[key]) === Object) {
            deepAssign(dest[key], src[key])
        } else {
            dest[key] = src[key]
        }
    }
}