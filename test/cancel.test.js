import { Context } from "../dist/index.js"
import {
    withCancel, 
    cancelCtx, 
    whenCancelled, 
    withCancelTimeout
} from "../dist/modules/cancel.js"
import {jest} from "@jest/globals"

let ctx = undefined
beforeEach(() => {
    jest.useFakeTimers('modern')
    ctx = withCancel(new Context())
});

describe("basic usage", () => {
    test("can be cancelled after promise", async () => {
        const whenExpected = expectRejection(ctx, "test")
        cancelCtx(ctx, "test")
        await whenExpected
    })

    test("can be cancelled before promise", async () => {
        cancelCtx(ctx, "test")
        await expectRejection(ctx, "test")
    })
})

describe("nested usage", () => {
    let child = undefined
    beforeEach(() => {
        child = withCancel(ctx)
    });

    test("parent will cancel child", async () => {
        cancelCtx(ctx, "test")
        await expectRejection(child, "test")
        await expectRejection(ctx, "test")
    })

    test("child will not cancel parent", async () => {
        cancelCtx(child, "test")
        await expectRejection(child, "test")
        //if whenCancelled(ctx) settles, it will reject before the resolve.
        await Promise.race([whenCancelled(ctx), Promise.resolve("ok")])
    })
})


describe("timeout", () => {
    test("cancels context after delay", async () => {
        ctx = withCancelTimeout(ctx, 500)
        const prom = expectRejection(ctx, "timeout")
        jest.advanceTimersByTime(500)
        await prom
    })
})

async function expectRejection(ctx, reason) {
    return await expect(whenCancelled(ctx))
        .rejects
        .toThrow(`Context has been cancelled. Reason: ${reason}`)
}