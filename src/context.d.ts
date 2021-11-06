type FN = (...args: any[]) => any
type PlainValues = FN | any[] | readonly any[]

export type Default<Def, Val> = Omit<Def, keyof Val> & Val

export type DefaultDeep<Def, Val> =
	Def extends object ? 
	Val extends object ?
		Val extends PlainValues ? Val : {
			[DK in keyof Def]: DK extends keyof Val ? 
				unknown
				: Def[DK]
		} & {
			[VK in keyof Val]: VK extends keyof Def ? 
				DefaultDeep<Def[VK], Val[VK]>
				: Val[VK]
		}
	: Val
	: Val

/** CtxObj takes an object and converts it to a context  */
export type CtxObj<Obj extends object> = Default<Context, {
    [Key in keyof Obj]: 
		Key extends symbol ? 
		Obj[Key] :
		CtxVal<Obj[Key]>
}>

/** CtxVal converts val to context if its an object */
type CtxVal<Val> = 
	Val extends PlainValues ? Val : 
	Val extends object ? CtxObj<Val>: 
	Val

export type ChildContext<Parent, Values extends object> = DefaultDeep<Parent, CtxObj<Values>>

export class Context {
    with<T, V extends object>(this: T, values: V): ChildContext<T, V>
	with<T, K extends keyof any, V>(this: T, key: K, value: V): ChildContext<T, {[key in K]: V}>
    withCtxFunction<T, K extends keyof object, A extends any[], R>
		(this: T, name: K, fn: (ctx: this, ...args: A) => R): ChildContext<T, {[key in K]: (...args: A) => R}>

	asObject(): object
}

export function setShouldFreeze(freeze: boolean): void