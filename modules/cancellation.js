import { ContextBuilder } from "../index.js"

const cancelStateSym = Symbol("cancel-state")

export function withCancel(ctx) {
    //TODO: make sure that withCancel on a lower and upper context behave where
    //a context will cancel any children context, but any parent contexts are 
    //unaffected even if they have a cancel set.
    //for now we just throw an error to prevent confusion
    if(ctx[cancelStateSym]) {
        throw new Error("Context already has cancellation set")
    }

    return new ContextBuilder()
        .with(cancelStateSym, {
            cancelled: false,
            reason: "",
            callbacks: []
        })
        .withCtxFunction(whenCancelled.name, whenCancelled)
        .build(ctx)
}

export function withTimeout(ctx, ms) {
    ctx = withCancel(ctx)
    setTimeout(() => cancelCtx(ctx, "timeout"), ms)
    return ctx
}

export function cancelCtx(ctx, reason) {
    const state = getCancelState(ctx)
    state.reason = reason
    state.cancelled = true
    for(const callb of state.callbacks) {
        callb(state.reason)
    }
}

export async function whenCancelled(ctx) {
    const state = getCancelState(ctx)
    //if its already cancelled, we throw early because we wont get a callback
    if(state.cancelled) {
        throw new Error(fmtReason(state.reason))
    }
    //return a promise that will be rejected when callbacks are called
    return new Promise((res, rej) => {
        state.callbacks.push((reason) => {
            rej(new Error(fmtReason(reason)))
        })
    })
}

function fmtReason(reason) {
    return `Context has been cancelled, reason: '${reason}'`
}

function getCancelState(ctx) {
    const state = ctx[cancelStateSym]
    if(state === undefined) {
        throw new Error("Context does not have cancellation set")
    }
    return state
}