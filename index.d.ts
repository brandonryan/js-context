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

export type ChildContext<Parent, Values extends object> = 
	Omit<Parent, keyof Values>
    & Contextify<Omit<Values, keyof Parent>>
    & ContextInsersect<Parent, Values>

type Merge<V1, V2> = Omit<V1, keyof V2> & V2

export class Context {
    with<This, V extends object>(this: This, values: V): ChildContext<This, V>
	with<This, K extends keyof any, V>(this: This, key: K, value: V): ChildContext<This, {[k in K]: V}>
    withCtxFunction<
		This,
		K extends keyof any,
		Args extends any[],
		R
	> (this: This, name: K, fn: (ctx: This, ...args: Args) => R): ChildContext<This, {[k in K]: (...args: Args) => R}>

	asObject(): object
}

type CtxFn<Ctx> = (ctx: Ctx, ...args: any[]) => any
type BuilderVal<C> = C extends ContextBuilder<infer V> ? V : never

export class ContextBuilder<T extends object={}> {
	with<U extends object>(values: U): ContextBuilder<Merge<T, U>>
	with<K extends keyof any, V>(key: K, value: V): ContextBuilder<Merge<T, { [k in K]: V }>>

    withCtxFunction<
		K extends keyof any, 
		Args extends any[],
		R
	>(name: K, fn: (ctx: ChildContext<Context, T>, ...args: Args) => R): 
		ContextBuilder<Merge<T, { [k in K]: (...args: Args) => R }>>

	build<C extends Context>(ctx: C): ChildContext<C, T>
	build<C extends ContextBuilder>(ctx: C): ContextBuilder<Merge<BuilderVal<C>, T>>
}