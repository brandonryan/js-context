import { ContextBuilder } from "../index.js";
const StoreSym = Symbol("store");
export function withStore(ctx) {
    const builder = new ContextBuilder();
    builder.with(StoreSym, new Map());
    builder.withCtxFunction("getStore", getStore);
    return builder.build(ctx);
}
export function getStore(ctx) {
    const store = ctx[StoreSym];
    if (!store) {
        throw new Error("Store not set on context");
    }
    return store;
}
