import {ChildContext, Context, DefaultDeep} from "./context"

type FN = (...args: any[]) => any

type BuilderVal<C> = C extends ContextBuilder<infer V> ? V : never
type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

type BuilderToContext<V extends object> = { 
	[K in keyof V]: 
		V[K] extends (ctx: ChildContext<Context, V>, ...args: any[]) => any
			? OmitFirstArg<V[K]>
			: V[K]
}

export class ContextBuilder<V extends object> {
	with(values: Partial<V>): this
	with<K extends keyof V>(key: K, value: V[K]): this
    withCtxFunction(name: keyof V, fn: (ctx: ChildContext<Context, V>, ...args: any[]) => any): this

	build<C extends ContextBuilder<any>>(ctx: C): ContextBuilder<DefaultDeep<BuilderVal<C>, V>>
	build<C extends Context>(ctx: C): ChildContext<C, BuilderToContext<V>>

	asObject(): object
}
