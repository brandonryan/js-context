export const makeChildContext = (ctx) => {
    return Object.create(ctx)
}

export class Context {
    withValue(key, value) {
        const ctx = makeChildContext(this)
        Object.defineProperty(ctx, key, {
            enumerable: true,
            value
        })
        return ctx
    }

    withValues(values) {
        const ctx = makeChildContext(this)
        for(const [key, value] of Object.entries(values)) {
            Object.defineProperty(ctx, key, {
                enumerable: true,
                value
            })
        }
        
        return ctx
    }

    withFunction(name, fn) {
        const ctx = makeChildContext(this)
        Object.defineProperty(ctx, name, {
            value: function (...args) { //this cant be an arrow function
                return fn(this, ...args)
            }
        })
        Object.freeze(ctx)
        return ctx
    }

    withCtxFunction(name, fn) {
        const ctx = makeChildContext(this)
        Object.defineProperty(ctx, name, {
            value: function (...args) { //this cant be an arrow function
                return fn(this, ...args)
            }
        })
        Object.freeze(ctx)
        return ctx
    }
}