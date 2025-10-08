/*
  3243 - FlattenDepth
  -------
  by jiangshan (@jiangshanmeta) #medium #array

  ### Question

  Recursively flatten array up to depth times.

  For example:

  ```typescript
  type a = FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2> // [1, 2, 3, 4, [5]]. flattern 2 times
  type b = FlattenDepth<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, [[5]]]. Depth defaults to be 1
  ```

  If the depth is provided, it's guaranteed to be positive integer.

  > View on GitHub: https://tsch.js.org/3243
*/

/* _____________ Your Code Here _____________ */

type Pop<Arr extends number[], _Acc extends number[] = []> =
	Arr extends [...infer ExceptLast extends number[], number] ? ExceptLast : [];

type CreateZeroesTuple<RepeatCount extends number, _Acc extends number[] = []> =
	_Acc["length"] extends RepeatCount ? _Acc : CreateZeroesTuple<RepeatCount, [0, ..._Acc]>;

type SubtractOne<
	Num1 extends number,
	_Tuple extends number[] = CreateZeroesTuple<Num1>,
	_TupleMinusOne extends number[] = Pop<_Tuple>,
> = _TupleMinusOne["length"];

type Cast<T, U> = T extends U ? T : U;

type FlattenDepth<
	Arr extends any[],
	Depth extends number = 1,
	_NextDepth extends number = SubtractOne<Depth>,
> =
	Depth extends 0 ? Arr
	: Arr extends [infer F, ...infer R] ?
		F extends any[] ?
			[...FlattenDepth<F, _NextDepth>, ...FlattenDepth<R, Depth>]
		:	[F, ...FlattenDepth<R, Depth>]
	:	[];

type test = FlattenDepth<[1, 2, [3, 4], [[[5]]]]>;
//   ^?

// Arr        					Depth       _Acc					_NextDepth
// [1, 2, [3, 4], [[[5]]]]		2			[]						1
// [2, [3, 4], [[[5]]]]			2			[1]						1
// [[3, 4], [[[5]]]]			2(check)	[1,2]					1
// [3, 4, [[[5]]]]				1			[1,2]					0
// [3, 4, [[[5]]]]				1			[1,2]					0

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
	Expect<Equal<FlattenDepth<[]>, []>>,
	Expect<Equal<FlattenDepth<[1, 2, 3, 4]>, [1, 2, 3, 4]>>,
	Expect<Equal<FlattenDepth<[1, [2]]>, [1, 2]>>,
	Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2>, [1, 2, 3, 4, [5]]>>,
	Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]]>, [1, 2, 3, 4, [[5]]]>>,
	Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 3>, [1, 2, 3, 4, [5]]>>,
	Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 19260817>, [1, 2, 3, 4, 5]>>,
];

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/3243/answer
  > View solutions: https://tsch.js.org/3243/solutions
  > More Challenges: https://tsch.js.org
*/
