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

type ReverseString<T extends string> =
	T extends `${infer F}${infer R}` ? `${ReverseString<R>}${F}` : T;

type SubtractOneReversed<T extends string> =
	T extends `${infer F extends number}${infer R}` ?
		F extends 0 ?
			`${9}${SubtractOneReversed<R>}`
		:	`${[never, "0", "1", "2", "3", "4", "5", "6", "7", "8"][F]}${R}`
	:	T;

type RemoveLeadingChar<T extends string, Char extends string> =
	T extends `${infer F}${infer R}` ?
		F extends Char ?
			RemoveLeadingChar<R, Char>
		:	T
	:	T;

type MinusOne<
	T extends number,
	_ReversedNum extends string = ReverseString<`${T}`>,
	_SubtractedOne extends string = SubtractOneReversed<_ReversedNum>,
	_ResultWithoutZero extends string = RemoveLeadingChar<ReverseString<_SubtractedOne>, "0">,
	_Result extends string = _ResultWithoutZero extends "" ? "0" : _ResultWithoutZero,
> = _Result extends `${infer Result extends number}` ? Result : never;

type FlattenDepth<
	Arr extends any[],
	Depth extends number = 1,
	_NextDepth extends number = MinusOne<Depth>,
> =
	Depth extends 0 ? Arr
	: Arr extends [infer F, ...infer R] ?
		F extends any[] ?
			[...FlattenDepth<F, _NextDepth>, ...FlattenDepth<R, Depth>]
		:	[F, ...FlattenDepth<R, Depth>]
	:	[];

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
