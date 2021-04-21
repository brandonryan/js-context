# JS-Context
*inspired by go's [context package](https://golang.org/pkg/context/).*

JS-Context is a library for passing scoped contextual information into your functions. The idea is that you would create a context, assign values on it, then pass it as the first argument to any functions down your stack. It guarantees that functions cannot modify the context outside of scope.

## Context Creation
A Context, at its bare minimum, is just an immutable object that you can pass around your functions.
```javascript
//context creation
let ctx = new Context()
doSomething(ctx, ...otherParams)
```

## Setting Values
You can use the `.with()` method on a context to set values. The `.with` function always returns a new context that inherits all properties from its parent. This allows for safety when passing the context deep into nested function calls, as there is no way to modify the context out of scope.
```javascript
//setting values on a context
let ctx = new Context()
ctx = ctx.with("foo", "bar") //set a single value (key, value)
ctx = ctx.with({foo: "bar"}) //set multiple values (values)
console.log(ctx.foo) // => bar
```

If you set a value on a context that is already set, the value will be shadowed so that the new context cannot see the previous value, but the original context value will be unmodified. You can think of this new context value as "shadowing" the old one.
```javascript
const rootCtx = new Context()
const ctx1 = rootCtx.with("foo", 0)
const ctx2 = ctx1.with("foo", 1)
console.log(ctx1.foo) // => 0
console.log(ctx2.foo) // => 1
```

## Merging Deep Values
When setting values that are objects, values will be deeply merged instead of being replaced. All plain objects have the same shadowing properties as described in the previous section.
```javascript
const rootCtx = new Context()
const ctx1 = rootCtx.with({
    obj: { a: "stays", b: 0 }
})
const ctx2 = ctx1.with({
    obj: { b: 1 }
})
console.log(ctx1.b) // => 0
console.log(ctx2.b) // => 1
console.log(ctx2.a) // => stays
```

## Functions With Context
You can attach functions to a context using `withCtxFunction` and the first argument to the function will always be the current context. Alternatively you can use `with(key, function(){})` and the current context will be `this`. Use this to add utility functions (such as logging) to the context.
```javascript
let ctx = new Context()
ctx = ctx.with("value", "Hello")

//withCtxFunction
ctx = ctx.withCtxFunction("log", (ctx, arg) => {
    console.log(ctx.value + " " + arg)
})
ctx.log("World") // => Hello World

//accessing ctx via this
ctx.with("log2", function(arg) {
    console.log(this.value + " " + arg)
})
ctx.log2("World") // => Hello World
```

## Deep Freezing
To guarantee immutability, JS-Context freezes all objects on the context by default.
```javascript
let ctx = new Context()
ctx.foo = "bar" // => Error: ctx is frozen

//objects get deeply frozen
ctx = ctx.with({obj: {a: 0}})
ctx.obj.a = 1 // => Error: obj is frozen
```
It is recommended to disable this feature when in production by using `setShouldFreeze(false)`. Freezing has been known to cause performance issues in certain javascript engines.

## Symbol keys
If you need an object on the context that you can modify directly by reference, use a symbol for the key. JS-Context will not do any deep merging with these values. This is useful for modules who need to maintain complex state, or values that should not be modifiable by the user of a module.
```javascript
const sym = Symbol("sym")
let ctx = new Context().with(sym, {
    state: 0
})
const value = ctx[sym]
value.state = 1 //valid because key is a symbol, causing state to be a plain object

ctx = ctx.with(sym, {other: 2}) //shadows the entire value (no deep nesting)
console.log(ctx[sym].other) // => 2
console.log(ctx[sym].state) // => undefined
```

## Internals
JS-Context uses prototype inheritance to ensure that when you set new values, you never modify the original context.

# Modules
**TODO**
## Store
## Cancel


