import { ContextBuilder } from "../index.js"

const cancelStateSym = Symbol("cancel-state")

export function withCancel(ctx) {
    return new ContextBuilder()
        .withValue(cancelStateSym, {
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
    const state = ctx[cancelStateSym]
    if(state === undefined) {
        throw new Error("Context does not have cancellation set")
    }

    state.reason = reason
    state.cancelled = true
    for(const callb of state.callbacks) {
        callb(state.reason)
    }
}

export async function whenCancelled(ctx) {
    const state = ctx[cancelStateSym]
    if(state.cancelled) {
        throw new Error(fmtReason(state.reason))
    }
    return new Promise((res, rej) => {
        state.callbacks.push((reason) => {
            rej(new Error(fmtReason(reason)))
        })
    })
}

function fmtReason(reason) {
    return `Context has been cancelled, reason: '${reason}'`
}