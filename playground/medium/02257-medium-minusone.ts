/*
  2257 - MinusOne
  -------
  by Mustafo Faiz (@fayzzzm) #medium #math

  ### Question

  Given a number (always positive) as a type. Your type should return the number decreased by one.

  For example:

  ```ts
  type Zero = MinusOne<1> // 0
  type FiftyFour = MinusOne<55> // 54
  ```

  > View on GitHub: https://tsch.js.org/2257
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

type debug = MinusOne<0>;
//   ^?

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
	Expect<Equal<MinusOne<1>, 0>>,
	Expect<Equal<MinusOne<55>, 54>>,
	Expect<Equal<MinusOne<3>, 2>>,
	Expect<Equal<MinusOne<100>, 99>>,
	Expect<Equal<MinusOne<1101>, 1100>>,
	Expect<Equal<MinusOne<9_007_199_254_740_992>, 9_007_199_254_740_991>>,
];

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/2257/answer
  > View solutions: https://tsch.js.org/2257/solutions
  > More Challenges: https://tsch.js.org
*/
