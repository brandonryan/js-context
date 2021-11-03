import { Context } from "../index.js";
import type { ChildContext } from "../context.js";
declare const cancelSym: unique symbol;
declare type CancelCallback = (reason: string) => void;
declare type CancelState = {
    reason?: string;
    parent?: CancelState;
    callbacks: CancelCallback[];
    timeoutId: number;
};
export declare type WithCancel = ChildContext<Context, CtxValues>;
interface CtxValues {
    [cancelSym]: CancelState;
    whenCancelled: () => Promise<void>;
}
/**
 * Sets cancellation on the context
 * use cancelCtx to cancel the context
 * use ctx.whenCancelled or whenCancelled to listen for ctx cancellation
 * TODO: notes about context cancellation with parents/children
 */
export declare function withCancel<C extends Context>(ctx: C): ChildContext<C, {
    whenCancelled: () => Promise<void>;
    [cancelSym]: CancelState;
}>;
export declare function cancelCtx(ctx: WithCancel, reason: string): void;
export declare function whenCancelled(ctx: WithCancel): Promise<void>;
/**
 * Adds cancellation to context that will be cancelled when specified timeout is reached
 */
export declare function withCancelTimeout<C extends WithCancel>(ctx: C, ms: number): ChildContext<Context, {
    whenCancelled: () => Promise<void>;
    [cancelSym]: CancelState;
}>;
export declare function cancelTimeout(ctx: WithCancel): void;
export {};
