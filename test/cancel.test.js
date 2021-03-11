import {ContextBuilder, Context} from "../index.js"
import {
    withCancel, 
    cancelCtx, 
    whenCancelled, 
    withCancelTimeout
} from "../modules/cancel.js"
import {jest} from "@jest/globals"

jest.useFakeTimers('modern')

let ctx = undefined
beforeEach(() => {
    ctx = withCancel(new Context())
});

describe("basic usage", () => {
    test("can be cancelled after promise", async () => {
        const whenExpected = expect(whenCancelled(ctx))
            .rejects
            .toThrow("Context has been cancelled. Reason: test")
        
        cancelCtx(ctx, "test")
        await whenExpected
    })

    test("can be cancelled before promise", async () => {
        cancelCtx(ctx, "test")
        await expect(whenCancelled(ctx))
            .rejects
            .toThrow("Context has been cancelled. Reason: test")
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
        const mockfn = jest.fn()

        cancelCtx(child, "test")
        await expectRejection(child, "test")
        whenCancelled(ctx).then(mockfn).catch(mockfn)
        expect(mockfn).not.toHaveBeenCalled()
    })
})


describe("timeout", () => {
    test.todo("test timeout stuff")
})

async function expectRejection(ctx, reason) {
    await expect(whenCancelled(ctx))
        .rejects
        .toThrow(`Context has been cancelled. Reason: ${reason}`)
}