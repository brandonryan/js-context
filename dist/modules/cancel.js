import { ContextBuilder } from "../index.js";
const cancelSym = Symbol("cancel-state");
/**
 * Sets cancellation on the context
 * use cancelCtx to cancel the context
 * use ctx.whenCancelled or whenCancelled to listen for ctx cancellation
 * TODO: notes about context cancellation with parents/children
 */
export function withCancel(ctx) {
    const ctxState = {
        reason: undefined,
        callbacks: [],
        timeoutId: 0,
    };
    if (hasCancellation(ctx)) {
        ctxState.parent = ctx[cancelSym];
    }
    //set up the functional bit
    return new ContextBuilder()
        .with(cancelSym, ctxState)
        .withCtxFunction("whenCancelled", whenCancelled)
        .build(ctx);
}
export function cancelCtx(ctx, reason) {
    const state = getCancelState(ctx);
    if (typeof reason !== 'string')
        throw new Error("Must provide a reason for cancellation.");
    if (getCancelReason(state) !== undefined)
        return;
    state.reason = reason;
    for (const callb of state.callbacks) {
        callb(state.reason);
    }
}
export async function whenCancelled(ctx) {
    const state = getCancelState(ctx);
    //if its already cancelled, we throw early because we wont get a callback
    const cancel = getCancelReason(state);
    if (cancel) {
        throw new Error(fmtReason(cancel));
    }
    //return a promise that will be rejected when callbacks are called
    return await new Promise((res, rej) => {
        addCallbackToContext(state, (reason) => {
            rej(new Error(fmtReason(reason)));
        });
    });
}
/**
 * Adds cancellation to context that will be cancelled when specified timeout is reached
 */
export function withCancelTimeout(ctx, ms) {
    const child = withCancel(ctx);
    const state = getCancelState(child);
    //Nodejs has weird typings. Have to convert to number with +
    state.timeoutId = +setTimeout(cancelCtx, ms, child, "timeout");
    return child;
}
export function cancelTimeout(ctx) {
    const state = getCancelState(ctx);
    clearTimeout(state.timeoutId);
}
function hasCancellation(ctx) {
    return ctx[cancelSym] !== undefined;
}
//checks recursively to find if the ctx is cancelled
//returns reason if it is, undefined otherwise
function getCancelReason(state) {
    if (state.reason !== undefined)
        return state.reason;
    if (state.parent)
        return getCancelReason(state.parent);
    return;
}
//adds the callback recursively to any parent cancellation context
function addCallbackToContext(state, callb) {
    state.callbacks.push(callb);
    if (state.parent !== undefined) {
        addCallbackToContext(state.parent, callb);
    }
}
function fmtReason(reason) {
    return `Context has been cancelled. Reason: ${reason}`;
}
function getCancelState(ctx) {
    const state = ctx[cancelSym];
    if (state === undefined) {
        throw new Error("Context does not have cancellation set.");
    }
    return state;
}
