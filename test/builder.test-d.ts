import { expectAssignable, expectError, expectType } from "tsd"
import { Context, ContextBuilder } from "../src/index";

//TODO: write tests for contextbuilder types
//right now its being used in cancel.ts so its fine.


//Note: we dont actually have to assign values because its all based on the generic
const builder = new ContextBuilder<{a: string}>()
const builder2 = new ContextBuilder<{b: number}>()
const ctx = new Context()

//Function signatures
expectError(builder.with('a'))
expectError(builder.with(0))
expectError(builder.with(false))
expectError(builder.with(Symbol()))

//Cant assign key not in template
expectError(builder.with('b', 'value'))
expectError(builder.with('c', 'value'))

//Cant assign value not in template
expectError(builder.with('a', 0))
expectError(builder.with('a', ['1', '2']))

//Basic Types
expectType<string>(builder.with('a', 'value').build(ctx).a)
expectType<string>(builder.with({a: 'value'}).build(ctx).a)

//Can't build on non context or context builder
expectError(builder.build('a'))
expectError(builder.build(0))
expectError(builder.build(false))
expectError(builder.build(Symbol()))
expectError(builder.build({}))

//Build from another context
{
    const c1 = builder.build(new Context())
    const c2 = builder2.build(c1)

    expectType<string>(c2.a)
    expectType<number>(c2.b)
}

//Build from another Builder
{
    //TODO
}
