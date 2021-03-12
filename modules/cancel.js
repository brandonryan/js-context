import { ContextBuilder, Context } from "../index.js"

const cancelSym = Symbol("cancel-state")

/**
 * Sets cancellation on the context
 * use cancelCtx to cancel the context
 * use ctx.whenCancelled or whenCancelled to listen for ctx cancellation
 * TODO: notes about context cancellation with parents/children
 * @param {Context|ContextBuilder} ctx 
 */
export function withCancel(ctx) {
    const ctxState = {
        reason: undefined,
        callbacks: [],
        //Note: using parent instead of children because you get into some hairy situations where if you
        //add a cancel to an already cancelled context you can end up with invalid state.
        parent: ctx[cancelSym],
        //timeout information if any
        timeoutId: 0
    }

    //can add just the value if we have a parent
    if(ctx.parent) {
        return ctx.with(cancelSym, ctxState)
    }

    //set up the functional bit
    return new ContextBuilder()
        .with(cancelSym, ctxState)
        .withCtxFunction(whenCancelled.name, whenCancelled)
        .build(ctx)
}

export function cancelCtx(ctx, reason) {
    const state = getCancelState(ctx)
    if(reason === undefined) throw new Error("Must provide a reason for cancellation.")
    if(getCancelled(state)) return

    state.reason = reason
    for(const callb of state.callbacks) {
        callb(state.reason)
    }
}

export async function whenCancelled(ctx) {
    const state = getCancelState(ctx)

    //if its already cancelled, we throw early because we wont get a callback
    const cancel = getCancelled(state)
    if(cancel) {
        throw new Error(fmtReason(cancel))
    }

    //return a promise that will be rejected when callbacks are called
    return await new Promise((res, rej) => {
        addCallbackToContext(state, (reason) => {
            rej(new Error(fmtReason(reason)))
        })
    })
}

/**
 * Adds cancellation to context that will be cancelled when specified timeout is reached
 * @param {Context} ctx 
 * @param {number} ms 
 */
export function withCancelTimeout(ctx, ms) {
    if(ctx instanceof ContextBuilder) {
        throw new Error("Cannot set timeout using context builder. You must pass an established context.")
    }

    ctx = withCancel(ctx)
    const state = getCancelState(ctx)
    state.timeoutId = setTimeout(cancelCtx, ms, ctx, "timeout")

    return ctx
}

export function cancelTimeout(ctx) {
    const state = getCancelState(state)
    clearTimeout(state.timeoutId)
}

//checks recursively to find if the ctx is cancelled
//returns reason if it is, undefined otherwise
function getCancelled(state) {
    if(state.reason !== undefined) return state.reason
    if(state.parent) return getCancelled(state.parent)
    return
}

//adds the callback recursively to any parent cancellation context
function addCallbackToContext(state, callb) {
    if(state === undefined) return
    state.callbacks.push(callb)
    return addCallbackToContext(state.parent, callb)
}

function fmtReason(reason) {
    return `Context has been cancelled. Reason: ${reason}`
}

function getCancelState(ctx) {
    const state = ctx[cancelSym]
    if(state === undefined) {
        throw new Error("Context does not have cancellation set.")
    }
    return state
}