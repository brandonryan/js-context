import { isPlainObject, isValidKey } from "./utils.js"

let ShouldFreeze = true
export function setShouldFreeze(val) {
	ShouldFreeze = Boolean(val)
}

/**
 * returns an unfrozen child context so that values can be assigned 
 * make sure to freeze this if ShouldFreeze is true before returning any child context
 * @returns {Context} 
 * */
export function makeChildContext(ctx) {
	return Object.create(ctx)
}

export class Context {
	constructor() {
		if(ShouldFreeze) {
			Object.freeze(this)
		}
	}

	with(key, value) {
		const child = makeChildContext(this)

		//in this case, treat key as values object only arg
		if(isPlainObject(key) && value === undefined) {
			//we need to manually assign any symbols
			for(const sym of Object.getOwnPropertySymbols(key)) {
				assignContextValue(child, sym, key[sym])
			}
			return deepAssignContext(child, key)
		}
		
		if(!isValidKey(key)) {
			throw new Error("Key must be a string or symbol")
		}

		//if value is an object we need to do deep assignment
		//we dont deep assign on symbols so that libraries can store objects by reference as state
		if(isPlainObject(value) && typeof key !== "symbol") {
			return deepAssignContext(child, {[key]: value})
		}

		assignContextValue(child, key, value)
		if(ShouldFreeze) {
			Object.freeze(child)
		}
		return child
	}

	//attaches a function to context, but creates a partial where the firts argument is always the current context.
	//i.e. fn: (ctx, ...args) => {}
	//TODO: consider getting rid of this function. You can achive the same this by .with(key, function() {this})
	withCtxFunction(name, fn) {
		return this.with(name, function (...args) { 
			return fn(this, ...args) 
		})
	}
}

//this ctx is assumed to be un-frozen
function deepAssignContext(ctx, src) {
	for(const [key, value] of Object.entries(src)) {
		//if its an object... https://tinyurl.com/ctxdeeper
		if(isPlainObject(value)) {
			let valueCtx = ctx[key] instanceof Context ?
				makeChildContext(ctx[key]) : //if the key on the context is a context, make it a child context.
				makeChildContext(new Context()) //otherwise, make it a new context child and shadow the value
			
			assignContextValue(ctx, key, deepAssignContext(valueCtx, value))
		} else {
			//just write the value and move on
			assignContextValue(ctx, key, value)
		}
	}

	//freeze on the way out because otherwise the nested contexts will not be frozen
	if(ShouldFreeze) {
		Object.freeze(ctx)
	}
	return ctx
}

function assignContextValue(ctx, key, value) {
	//dont have to worry about _proto__ prototype injection because this will always assign the property properly
	Object.defineProperty(ctx, key, {
		enumerable: value === "function" ? false : true,
		value
	})
}