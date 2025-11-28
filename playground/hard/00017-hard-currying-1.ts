/*
  17 - Currying 1
  -------
  by Anthony Fu (@antfu) #hard #array

  ### Question

  > TypeScript 4.0 is recommended in this challenge

  [Currying](https://en.wikipedia.org/wiki/Currying) is the technique of converting a function that takes multiple arguments into a sequence of functions that each take a single argument.

  For example:

  ```ts
  const add = (a: number, b: number) => a + b
  const three = add(1, 2)

  const curriedAdd = Currying(add)
  const five = curriedAdd(2)(3)
  ```

  The function passed to `Currying` may have multiple arguments, you need to correctly type it.

  In this challenge, the curried function only accept one argument at a time. Once all the argument is assigned, it should return its result.

  > View on GitHub: https://tsch.js.org/17
*/

/* _____________ Your Code Here _____________ */

// gets the first element within a tuple as a tuple, this preserves the tuple label
// source: https://stackoverflow.com/a/72244704/388951
type FirstAsTuple<T extends unknown[]> =
	T extends [any, ...infer R] ?
		T extends [...infer F, ...R] ?
			F
		:	never
	:	never;

type CurriedFunction<Args extends unknown[], Return> =
	Args extends [any, ...infer RestArgs] ?
		(...arg: FirstAsTuple<Args>) => CurriedFunction<RestArgs, Return>
	:	Return;

type ParametersAndReturnType<Fn extends Function> =
	Fn extends (...args: infer Parameters) => infer Return ?
		{ parameters: Parameters; return: Return }
	:	never;

declare function Currying<Fn extends Function>(
	fn: Fn
): ParametersAndReturnType<Fn> extends (
	{ parameters: infer Params extends unknown[]; return: infer Return }
) ?
	Params extends [] ?
		() => Return
	:	CurriedFunction<Params, Return>
:	never;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

const curried1 = Currying((a: string, b: number, c: boolean) => true);
const curried2 = Currying(
	(a: string, b: number, c: boolean, d: boolean, e: boolean, f: string, g: boolean) => true
);
const curried3 = Currying(() => true);

type cases = [
	Expect<Equal<typeof curried1, (a: string) => (b: number) => (c: boolean) => true>>,
	Expect<
		Equal<
			typeof curried2,
			(
				a: string
			) => (
				b: number
			) => (c: boolean) => (d: boolean) => (e: boolean) => (f: string) => (g: boolean) => true
		>
	>,
	Expect<Equal<typeof curried3, () => true>>,
];

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/17/answer
  > View solutions: https://tsch.js.org/17/solutions
  > More Challenges: https://tsch.js.org
*/
