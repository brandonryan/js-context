const { ContextBuilder } = require("../lib/builder")

const StoreSym = new Symbol("Store")

export function withStore(ctx) {
    const builder = new ContextBuilder()
        .with(StoreSym, new Map())
        .withCtxFunction(getStore.name, getStore)
    return builder.build(ctx)
}

export function getStore(ctx) {
    const store = ctx[StoreSym]
    if(!store) {
        throw new Error("Store not set on context")
    }
    return store
}