import { Context, ContextBuilder } from "../index.js"
import type {ChildContext} from "../context.js"

const StoreSym = Symbol("store")

export type WithStore = ChildContext<Context, CtxValues<unknown, unknown>>
interface CtxValues<K, V> {
    [StoreSym]: Map<K, V>
    getStore: typeof getStore
}

export function withStore<C extends Context, K=any, V=any>(ctx: C) {
    const builder = new ContextBuilder<CtxValues<K, V>>()
    builder.with(StoreSym, new Map())
    builder.withCtxFunction("getStore", getStore)

    return builder.build(ctx)
}

export function getStore(ctx: WithStore) {
    const store = ctx[StoreSym]
    if(!store) {
        throw new Error("Store not set on context")
    }
    return store
}