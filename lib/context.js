export let ShouldFreeze = true

/** @returns {Context} */
export const makeChildContext = (ctx) => {
    return Object.create(ctx)
}

export class Context {
    with(key, value) {
        const child = makeChildContext(this)

        //in this case, treat key as values only arg
        if(Object.getPrototypeOf(key) === Object) {
            return deepAssignContext(child, key)
        }

        //if value is an object we need to do deep assignment
        //otherwise just set the prop
        if(Object.getPrototypeOf(value) === Object) {
            assignContextValue(child, key, deepAssignContext(child[key], value))
        } else {
            assignContextValue(child, key, value)
        }

        if(ShouldFreeze) {
            Object.freeze(child)
        }
        return child
    }

    //attaches a function to context, but creates a partial where the firts argument is always the current context.
    //i.e. fn: (ctx, ...args) => {}
    withCtxFunction(name, fn) {
        return ctx.with(name, function (...args) { 
            return fn(this, ...args) 
        })
    }
}

function deepAssignContext(ctx, src) {
    for(const [key, value] of Object.entries(src)) {
        //if its an object...
        //https://tinyurl.com/ctxdeeper
        if(Object.getPrototypeOf(value) === Object) {
            //if the key on the context is a context, make it a child context.
            //otherwise, make it a new context and overwrite the value
            ctx[key] = ctx[key] instanceof Context ? 
                makeChildContext(ctx[key]) : 
                new Context()
            
            deepAssignContext(ctx[key], value)
        } else {
            //just write the value and move on
            assignContextValue(ctx, key, value)
        }
    }
    //freeze on the way out because otherwise the nested contexts will not be frozen
    if(ShouldFreeze) {
        Object.freeze(ctx)
    }
    return ctx
}

function assignContextValue(ctx, key, value) {
    //dont have to worry about _proto__ prototype injection because this will always assign the property properly
    Object.defineProperty(ctx, key, {
        enumerable: value === "function" ? false : true,
        value
    })
}