const { makeChildContext, Context } = require("./context")

//private variables
const priv = new WeakMap()

export class ContextBuilder {
    constructor() {
        priv.set(this, {
            values: [],
            functions: []
        })
    }

    withValue(key, value) {
        priv.get(this).values[key] = value
        return this
    }

    withValues(values) {
        Object.assign(priv.get(this).values, values)
        return this
    }

    withFunction(name, fn) {
        priv.get(this).values[name] = fn
        return this
    }

    withCtxFunction(name, fn) {
        priv.get(this).values[name] = function (...args) { //this cant be an arrow function
            return fn(this, ...args)
        }
        return this
    }

    build(ctx) {
        if(ctx instanceof ContextBuilder) {
            return inheritBuild(ctx, this)
        }
        if(!(ctx instanceof Context)) {
            throw new Error("ctx must be a context object")
        }
        const child = makeChildContext(ctx)
        const {values, functions} = priv.get(this)

        for(const key in values) {
            Object.defineProperty(child, key, {
                enumerable: true,
                value: items.values[key]
            })
        }

        for(const name in functions) {
            Object.defineProperty(child, name, {
                value: items.functions[name]
            })
        }

        return child
    }
}

function inheritBuild(ctx, from) {
    ctx = priv.get(ctx)
    from = priv.get(from)

    ctx.values.push(...from.values)
    ctx.functions.push(...from.functions)
}