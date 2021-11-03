import { Context } from "../index.js";
import type { ChildContext } from "../context.js";
declare const StoreSym: unique symbol;
export declare type WithStore = ChildContext<Context, CtxValues>;
interface CtxValues {
    [StoreSym]: Map<any, any>;
    getStore: typeof getStore;
}
export declare function withStore<C extends Context>(ctx: C): ChildContext<C, {
    getStore: () => Map<any, any>;
    [StoreSym]: Map<any, any>;
}>;
export declare function getStore(ctx: WithStore): Map<any, any>;
export {};
