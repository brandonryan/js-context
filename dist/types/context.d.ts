type ContextInsersect<C, Values extends object> = {
    [Prop in Extract<keyof C, keyof Values>]:
        Prop extends symbol
            ? Values[Prop]
            : ContextValue<C[Prop], Values[Prop]>
}

type ContextValue<Parent, Value> =
	Value extends Function
		? Value
		: Value extends object
			? Parent extends Context
				? ChildContext<Parent, Value>
				: ChildContext<Context, Value>
			: Value
	

type Contextify<T extends object> = {
    [Prop in keyof T]: 
		Prop extends symbol
			? T[Prop]
			: ContextValue<undefined, T[Prop]>
}

export type Merge<V1, V2> = Omit<V1, keyof V2> & V2

export type ChildContext<Parent, Values extends object> = 
	Omit<Parent, keyof Values>
    & Contextify<Omit<Values, keyof Parent>>
    & ContextInsersect<Parent, Values>

export class Context {
    with<V extends object>(values: V): ChildContext<this, V>
	with<K extends keyof any, V>(key: K, value: V): ChildContext<this, {[key in K]: V}>
    withCtxFunction<K extends keyof object, A extends any[], R>
		(name: K, fn: (ctx: this, ...args: A) => R): ChildContext<this, {[key in K]: (...args: A) => R}>

	asObject(): object
}

export function setShouldFreeze(freeze: boolean): void