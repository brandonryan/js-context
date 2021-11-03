import { Context, ContextBuilder } from "../index"
import type {ChildContext} from "../context"

const StoreSym = Symbol("store")

export type WithStore = ChildContext<Context, CtxValues>
interface CtxValues {
    [StoreSym]: Map<any, any>
    getStore: typeof getStore
}

export function withStore<C extends Context>(ctx: C) {
    const builder = new ContextBuilder<CtxValues>()
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