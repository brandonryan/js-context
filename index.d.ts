type ContextInsersect<C, Values extends object> = {
    [Prop in Extract<keyof C, keyof Values>]:
        Prop extends symbol
            ? Values[Prop]
            : ContextValue<C[Prop], Values[Prop]>
}

type ContextValue<Parent, Value> =
	Value extends object
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

export type ChildContext<Parent, Values extends object> = 
	Omit<Parent, keyof Values>
    & Contextify<Omit<Values, keyof Parent>>
    & ContextInsersect<Parent, Values>

export class Context {
    with<This, V extends object>(this: This, values: V): ChildContext<This, V>
	with<This, K extends keyof any, V>(this: This, key: K, value: V): ChildContext<This, {[k in K]: V}>
    withCtxFunction<This, K extends keyof any, Args extends any[]>(this: This, name: K, fn: (ctx: This, ...args: Args) => any): ChildContext<This, {[k in K]: typeof fn}>
	asObject(): object
}