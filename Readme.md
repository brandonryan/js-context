# JS-Context
*inspired by go's [context package](https://golang.org/pkg/context/).*

>⤵️ Pass scoped data and functionality down your stack  
>🔐 Immutability guarantee  
>💪 Typescript support  
>📄 Zero dependencies

## Context Creation
A Context, at its bare minimum, is just an immutable (frozen) object that you can pass around your functions.
```javascript
//context creation
let ctx = new Context()
doSomething(ctx, ...otherParams)
```

## Setting Values
You can use the `.with()` method on a context to set values. The `.with` function always returns a new context that inherits all properties from its parent. This allows for safety when passing the context deep into nested function calls, as there is no way to modify the context out of scope. This is the only way to set values on a context.
```javascript
//setting values on a context
let ctx = new Context()
ctx = ctx.with("foo", "bar") //set a single value (key, value)
ctx = ctx.with({foo: "bar"}) //set multiple values (values)
console.log(ctx.foo) // => bar
```

If you set a value on a context that is already set, the value will be shadowed so that the new context cannot see the previous value, but the original context value will be unmodified.
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

## Symbol keys
If you need an object on the context that maintains reference equality, use a symbol for the key. JS-Context will not do any deep merging with these values. This is useful for modules who need to maintain complex state, or values that should not be directly modifiable by the context user.
```javascript
const sym = Symbol("example symbol")
const init = {state: 0}
let ctx = new Context().with(sym, init)

console.log(ctx[sym].state) // => 0
console.log(ctx[sym].state === init) // => true

ctx[sym].state = 1 //valid because key is a symbol, therefore state is the original unmodified object
console.log(ctx[sym].state) // => 1
console.log(init.state) // => 1

ctx = ctx.with(sym, {other: 2}) //shadows the entire value (no deep nesting)
console.log(ctx[sym].other) // => 2
console.log(ctx[sym].state) // => undefined
```

## Functions On Context
You can attach functions to a context using `withCtxFunction`. Use this to add utility functions (such as logging) to the context. The first argument to the function will always be the current context. Alternatively you can use `with(key, function(){})` and the current context will be `this`.
```javascript
let ctx = new Context()
ctx = ctx.with("logLevel", 4)
ctx = ctx.withCtxFunction("log", (ctx, ...args) => {
    if(ctx.logLevel > 3) {
        console.log(...args)
    }
})
ctx.log("Hello World") // => Hello World
```
Example using `this`
```javascript
//accessing ctx via this
ctx.with("log", function(arg) {
    if(ctx.logLevel > 3) {
        console.log(...args)
    }
})
ctx.log("Hello World") // => Hello World
```

## Performance
### Context Deep Freezing
To guarantee immutability, JS-Context freezes all objects on the context by default.  
It is recommended to disable this feature when in production by using `setShouldFreeze(false)`. Freezing has been known to cause performance issues in certain javascript engines.
```javascript
let ctx = new Context()
ctx.foo = "bar" // => Error: ctx is frozen

//objects get deeply frozen
ctx = ctx.with({obj: {a: 0}})
ctx.obj.a = 1 // => Error: obj is frozen
```
### Prototype chain
JS-Context uses prototype inheritance to allow for the "shadowing" behavior without making copies of the data every time you use `with`. However, this comes at the cost of runtime lookup performance. When you access a property, the javascript engine has to walk all the way up the prototype chain until it finds the property its looking for. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain for more information on prototype chains.  
If you have a lot of properties to add, and you want to avoid this performance cost, use the `ContextBuilder`. It avoids the prototype inheritance by putting all the properties on the same object.

# Modules
Modules are libraries that expose functionality on a context via the .with() methods. Some of these expose functions as properties on the context, other functions must be called, passing a context.

Official Modules:
name | description
---|---
cancel | Adds timeout/cancel to context
store | Share data between child contexts
[winston](https://npmjs.com/package/js-context-winston) | Contextual winston logging
[aws-lambda](https://npmjs.com/package/js-context-aws-lambda) | AWS lambda timeout and AWS context information
[knex](https://npmjs.com/package/js-context-knex) | Adds knex to context
[mssql](https://npmjs.com/package/js-context-mssql) | Adds mssql to context

Community Modules:
## Please contribute and submit a pull request to be listed here! 😄