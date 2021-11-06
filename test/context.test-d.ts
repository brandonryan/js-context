import {expectAssignable, expectError, expectType} from "tsd"
import {Context} from "../src/index"

const ctx = new Context()

//Test function signatures
expectError(ctx.with('a'))
expectError(ctx.with(0))
expectError(ctx.with(false))
expectError(ctx.with(Symbol()))

//Test with basic types
expectType<number>(ctx.with('a', 0).a)
expectType<string>(ctx.with('a', 'b').a)
expectType<number>(ctx.with({a: 0}).a)
expectType<string>(ctx.with({a: 'b'}).a)

//Test with const primitives
expectType<0>(ctx.with('a', 0 as const).a)
expectType<'b'>(ctx.with('a', 'b' as const).a)

//Test with tuples
expectType<[0, 1]>(ctx.with('a', [0, 1] as [0, 1]).a)
expectType<readonly [0, 1]>(ctx.with('a', [0, 1] as const).a)

//Test with const values
expectType<0>(ctx.with({a: 0 as const}).a)
expectType<'b'>(ctx.with({a: 'b' as const}).a)

//Test with nested objects
expectAssignable<{a: number}>(ctx.with({a: {a: 0}}).a)
expectAssignable<{a: number}>(ctx.with({a: {a: {a: 0}}}).a.a)

//Test makes object context
expectAssignable<Context>(ctx.with({}))
expectAssignable<Context>(ctx.with({a: 'hello'}))
expectAssignable<Context>(ctx.with({a: {a: 'hello'}}).a)

//Test type shadowing
expectType<string>(ctx.with('a', 0).with('a', 'str').a)
expectType<string>(ctx.with('a', 0).with({a: 'str'}).a)
expectType<string>(ctx.with({a: 0}).with('a', 'str').a)
expectType<string>(ctx.with({a: 0}).with({a: 'str'}).a)

//Test type shadowing with object
expectType<number>(ctx.with('a', {a: 0}).with('a', 0).a)
expectType<number>(ctx.with('a', 0).with('a', {a: 0}).a.a)
expectAssignable<Context>(ctx.with('a', 0).with('a', {a: 0}).a)

//Shadowing does not lose other values
expectType<number>(ctx.with({a: 0, b: 1}).with({b: 2}).a)
expectType<number>(ctx.with({val: {a: 0, b: 1}}).with({val: {b: 1}}).val.a)