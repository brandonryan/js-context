import {ContextBuilder, Context} from "../index.js"
import {jest} from "@jest/globals"

const propErr = new Error("ContextBuilder does not allow retrieving properties. build() the context first.")

let builder
beforeEach(() => {
	builder = new ContextBuilder()
});

describe("builder", () => {
	test("can be created", () => {
		expect(new ContextBuilder()).toBeInstanceOf(ContextBuilder)
	})

	test("should contain all Context functions", () => {
		const contextProps = Object.getOwnPropertyNames(Context.prototype)
		const builderProps = Object.getOwnPropertyNames(ContextBuilder.prototype)
		for(const name of contextProps) {
			expect(builderProps).toContain(name)
		}
	})

	test("should not allow retrieving values", () => {
		//test for all the ways to set values
		builder.with("key1", "value")
		expect(() => builder.key1).toThrow(propErr)

		builder.with("key2", {value: 0})
		expect(() => builder.key2.value).toThrow(propErr)

		builder.with({key3: {value: 0}})
		expect(() => builder.key3.value).toThrow(propErr)

		builder.withCtxFunction("fn", () => {})
		expect(() => builder.fn()).toThrow(propErr)

		const sym = Symbol("test-sym")
		builder.with(sym, "value")
		expect(() => builder[sym]).toThrow(propErr)
	})

	test("should build values", () => {
		const fn = jest.fn((ctx) => ctx.key)
		const sym = Symbol("test-sym")

		const ctx = builder
			.with("key", "val")
			.with(sym, "val")
			.withCtxFunction("fn", fn)
			.build(new Context())
		ctx.fn()
		expect(ctx[sym]).toEqual("val")
		expect(ctx.key).toEqual("val")
		expect(fn).toHaveReturnedWith("val")
	})

	test("should inherit build", () => {
		const sym = Symbol("test-sym")
		const inherited = builder
			.with("key", "value")
			.with(sym, "value")
			.build(new ContextBuilder())

		expect(() => builder.key).toThrow(propErr)
		expect(() => builder[sym]).toThrow(propErr)

		const ctx = inherited.build(new Context())
		expect(ctx.key).toEqual("value")
		expect(ctx[sym]).toEqual("value")
	})

	test("functions should behave the same as context for build", () => {
		const fn = jest.fn(() => 0)
		const sym = Symbol("test-sym")

		const doAssignments = (ctx) => ctx
			.with("key", "value")
			.with(sym, "symvalue")
			.with({ deeply: { nested: {
				value: 0,
				[sym]: "nested symvalue",
				shadowValue: 0
			} } })
			.with({ deeply: { nested: {
				otherValue: 0,
				shadowValue: 1
			} } })
			.withCtxFunction("fn", fn)

		const doExpectations = (ctx) => {
			ctx.fn()
			expect(ctx.key).toEqual("value")
			expect(ctx[sym]).toEqual("symvalue")
			expect(ctx.deeply.nested.value).toEqual(0)
			expect(ctx.deeply.nested[sym]).toEqual("nested symvalue")
			expect(ctx.deeply.nested.shadowValue).toEqual(1)
			expect(ctx.deeply.nested.otherValue).toEqual(0)
			expect(fn).toHaveReturnedWith(0)
		}

		//test the context
		const ctx = doAssignments(new Context())
		doExpectations(ctx)

		//test the context that comes from builder
		builder = doAssignments(builder)
		doExpectations(builder.build(new Context()))

		//test the context that comes from and inherited build
		let inherited = builder.build(new ContextBuilder())
		doExpectations(inherited.build(new Context()))
	})
})