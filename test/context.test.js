import {Context, setShouldFreeze} from "../index.js"
import {jest} from "@jest/globals"

let ctx
beforeEach(() => {
	ctx = new Context()
});

describe("ctx.with() basic usage", () => {
	test("can set with(key, value)", () => {
		const child = ctx.with("key", "value")
		expect(child.key).toEqual("value")
		expect(ctx.key).toBeUndefined()
	})

	test("can set with(object)", () => {
		const child = ctx.with({key: "value"})
		expect(child.key).toEqual("value")
		expect(ctx.key).toBeUndefined()
	})

	test("can't set non-plain object", () => {
		const ctr = function() { this.key = "value" }
		const obj = new ctr()
		expect(() => ctx.with(obj)).toThrow(new Error("Key must be a string or symbol"));
	})

	test("should shadow parent values", () => {
		const child0 = ctx.with("key", 0)
		const child1 = child0.with("key", 1)
		expect(child0.key).toEqual(0)
		expect(child1.key).toEqual(1)
	})
})

describe("ctx.with() advanced useage", () => {
	test("can do deep context assignment with(key, value)", () => {
		ctx = ctx.with("nested", { key: "value" })
		expect(ctx.nested).toBeInstanceOf(Context)
		expect(ctx.nested.key).toEqual("value")
	})

	test("can do deep context assignment with(object)", () => {
		ctx = ctx.with({
			nested: { key: "value" }
		})
		expect(ctx.nested).toBeInstanceOf(Context)
		expect(ctx.nested.key).toEqual("value")
	})

	test.todo("should shadow deeply")
})

describe("shouldFreeze", () => {
	describe("true", ()=> {
		test("should freeze", () => {
			expect(Object.isFrozen(ctx)).toBeTruthy()
			ctx = ctx.with("key", "value")
			expect(Object.isFrozen(ctx)).toBeTruthy()
		})

		test("should freeze deeply", () => {
			ctx = ctx.with({deep: {key: "value"}})
			expect(Object.isFrozen(ctx)).toBeTruthy()
			expect(Object.isFrozen(ctx.deep)).toBeTruthy()
		})
	})

	describe("false", ()=> {
		beforeAll(() => setShouldFreeze(false))

		test("shouldn't freeze", () => {
			expect(Object.isFrozen(ctx)).toBeFalsy()
			ctx = ctx.with("key", "value")
			expect(Object.isFrozen(ctx)).toBeFalsy()
		})
		
		test("shouldn't freeze deeply", () => {
			ctx = ctx.with({deep: {key: "value"}})
			expect(Object.isFrozen(ctx)).toBeFalsy()
			expect(Object.isFrozen(ctx.deep)).toBeFalsy()
		})

		afterAll(() => setShouldFreeze(true))
	})
})

describe("symbols", () => {
	const sym = Symbol("test symbol")

	test("should work with(key, value)", () => {
		ctx = ctx.with(sym, "value")
		expect(ctx[sym]).toEqual("value")
	})

	test("should work with(object)", () => {
		ctx = ctx.with({[sym]: "value"})
		expect(ctx[sym]).toEqual("value")
	})

	test("shouldn't deeply assign", () => {
		const obj = {
			some: "state",
			with: "complex values"
		}
		ctx = ctx.with(sym, obj)
		expect(ctx[sym]).toBe(obj)
	})
})

describe("ctx.withCtxFunction()", () => {
	const mockfn = jest.fn()

	test("can add function", () => {
		ctx = ctx.withCtxFunction("mocked", mockfn)
		ctx.mocked()
		expect(mockfn).toHaveBeenCalledWith(ctx)
	})

	test("ctxFunction should always get current context", () => {
		//set the function
		const child1 = ctx.withCtxFunction("mocked", mockfn)
		//add a key later on
		const child2 = child1.with("key", "value")

		child1.mocked()
		expect(mockfn).toHaveBeenCalledWith(child1)
		child2.mocked()
		expect(mockfn).toHaveBeenCalledWith(child2)
	})
})

describe("security", () => {
	test.todo("cant do prototype injection")
})