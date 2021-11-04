import { Context, ContextBuilder } from "../index.js"
import type {ChildContext} from "../context.js"

const cancelSym = Symbol("cancel-state")

type CancelCallback = (reason: string) => void
type CancelState = {
    reason?: string
    //Note: using parent instead of children because you get into some hairy situations where if you
    //add a cancel to an already cancelled context you can end up with invalid state.
    parent?: CancelState
    callbacks: CancelCallback[]
    timeoutId: number
}

export type WithCancel = ChildContext<Context, CtxValues>
type CtxValues = {
    [cancelSym]: CancelState
    whenCancelled: typeof whenCancelled
}

/**
 * Sets cancellation on the context
 * use cancelCtx to cancel the context
 * use ctx.whenCancelled or whenCancelled to listen for ctx cancellation  
 * TODO: notes about context cancellation with parents/children
 */
export function withCancel<C extends Context>(ctx: C): WithCancel {
    const ctxState: CancelState = {
        reason: undefined,
        callbacks: [],
        timeoutId: 0,
    }

    if(hasCancellation(ctx)) {
        ctxState.parent = ctx[cancelSym]
    }

    //set up the functional bit
    return new ContextBuilder<CtxValues>()
        .with(cancelSym, ctxState)
        .withCtxFunction("whenCancelled", whenCancelled)
        .build(ctx)
}

export function cancelContext(ctx: WithCancel, reason: string) {
    const state = getCancelState(ctx)
    
    if(typeof reason !== 'string') throw new Error("Must provide a reason for cancellation.")
    if(getCancelReason(state) !== undefined) return

    state.reason = reason
    for(const callb of state.callbacks) {
        callb(state.reason)
    }
}

export async function whenCancelled(ctx: WithCancel): Promise<void> {
    const state = getCancelState(ctx)

    //if its already cancelled, we throw early because we wont get a callback
    const cancel = getCancelReason(state)
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
 */
export function withCancelTimeout<C extends Context>(ctx: C, ms: number) {
    const child = withCancel(ctx)
    
    const state = getCancelState(child)
    //Nodejs has weird typings. Have to convert to number with +
    state.timeoutId = +setTimeout(cancelContext, ms, child, "timeout")

    return child
}

export function cancelTimeout(ctx: WithCancel) {
    const state = getCancelState(ctx)
    clearTimeout(state.timeoutId)
}

function hasCancellation(ctx: Context): ctx is WithCancel {
    return (ctx as any)[cancelSym] !== undefined
}

//checks recursively to find if the ctx is cancelled
//returns reason if it is, undefined otherwise
function getCancelReason(state: CancelState): string|undefined {
    if(state.reason !== undefined) return state.reason
    if(state.parent) return getCancelReason(state.parent)
    return
}

//adds the callback recursively to any parent cancellation context
function addCallbackToContext(state: CancelState, callb: CancelCallback) {
    state.callbacks.push(callb)
    if(state.parent !== undefined) {
        addCallbackToContext(state.parent, callb)
    }
}

function fmtReason(reason: string) {
    return `Context has been cancelled. Reason: ${reason}`
}

function getCancelState(ctx: WithCancel) {
    const state = ctx[cancelSym]
    if(state === undefined) {
        throw new Error("Context does not have cancellation set.")
    }
    return state
}