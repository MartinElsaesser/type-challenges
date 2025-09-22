/*
  151 - Query String Parser
  -------
  by Pig Fang (@g-plane) #extreme #template-literal

  ### Question

  You're required to implement a type-level parser to parse URL query string into a object literal type.

  Some detailed requirements:

  - Value of a key in query string can be ignored but still be parsed to `true`. For example, `'key'` is without value, so the parser result is `{ key: true }`.
  - Duplicated keys must be merged into one. If there are different values with the same key, values must be merged into a tuple type.
  - When a key has only one value, that value can't be wrapped into a tuple type.
  - If values with the same key appear more than once, it must be treated as once. For example, `key=value&key=value` must be treated as `key=value` only.

  > View on GitHub: https://tsch.js.org/151
*/

/* _____________ Your Code Here _____________ */

import { expectTypeOf } from "expect-type";

type JoinIntersections<T> = {
	[K in keyof T]: T[K];
};

type TokenizeQueryParams<S extends string> =
	S extends "" ? {}
	: S extends `${infer K}=${infer V extends string}` ?
		{
			[P in K]: V;
		}
	:	{
			[P in S]: true;
		};

type Tokenizer<S extends string, Collect extends Record<string, TokenValues[] | TokenValues> = {}> =
	S extends `${infer W1}&${infer W2}` ?
		Tokenizer<W2, MergeObjIntoArr<TokenizeQueryParams<W1>, Collect>>
	:	MergeObjIntoArr<TokenizeQueryParams<S>, Collect>;

type ParseQueryString<S extends string> = JoinIntersections<Tokenizer<S>>;

type TokenValues = string | true;
type MergeObjIntoArr<
	TObj extends Record<string, TokenValues>,
	TArr extends Record<string, TokenValues[] | TokenValues>,
	CommonKeys extends string = Extract<keyof TObj & string, keyof TArr & string>,
> = Omit<TObj, CommonKeys> &
	Omit<TArr, CommonKeys> & {
		[P in CommonKeys]: TArr[P] extends TokenValues[] ? StringArrMerge<TObj[P], TArr[P]>
		:	StringMerge<TObj[P], TArr[P] & TokenValues>;
	};

type StringArrMerge<T extends TokenValues, TArr extends TokenValues[]> =
	T extends TArr[number] ? TArr : [...TArr, T];
type StringMerge<T2 extends TokenValues, T1 extends TokenValues> =
	[T2, T1] extends [T1, T2] ? T1 : [T1, T2];

type TMO<
	TObj extends Record<string, TokenValues>,
	TArr extends Record<string, TokenValues | TokenValues[]>,
> = JoinIntersections<MergeObjIntoArr<TObj, TArr>>;

// independent objects
expectTypeOf<TMO<{ k2: "v2"; k4: "v4" }, { k1: "v1"; k3: "v3" }>>().toEqualTypeOf<{
	k1: "v1";
	k2: "v2";
	k3: "v3";
	k4: "v4";
}>();
expectTypeOf<TMO<{ k2: "v2" }, { k1: "v1" }>>().toEqualTypeOf<{ k1: "v1"; k2: "v2" }>();
expectTypeOf<TMO<{ k1: "v1" }, {}>>().toEqualTypeOf<{ k1: "v1" }>();
expectTypeOf<TMO<{}, { k2: "v2" }>>().toEqualTypeOf<{ k2: "v2" }>();

// dependent objects: no duplicates
expectTypeOf<TMO<{ k1: "v2" }, { k1: "v1" }>>().toEqualTypeOf<{ k1: ["v1", "v2"] }>();
expectTypeOf<TMO<{ k1: "v1" }, { k1: "v0" }>>().toEqualTypeOf<{ k1: ["v0", "v1"] }>();

expectTypeOf<TMO<{ k1: "v3" }, { k1: ["v1", "v2"] }>>().toEqualTypeOf<{
	k1: ["v1", "v2", "v3"];
}>();

expectTypeOf<TMO<{}, { k1: ["v1", "v2"] }>>().toEqualTypeOf<{
	k1: ["v1", "v2"];
}>();

// dependent objects: duplicates
expectTypeOf<TMO<{ k1: true }, { k1: true }>>().toEqualTypeOf<{ k1: true }>();
expectTypeOf<TMO<{ k1: true }, { k1: [true, "false"] }>>().toEqualTypeOf<{ k1: [true, "false"] }>();
expectTypeOf<TMO<{ k1: "v1" }, { k1: "v1" }>>().toEqualTypeOf<{ k1: "v1" }>();
expectTypeOf<TMO<{ k1: "v1" }, { k1: ["v1", "v2"] }>>().toEqualTypeOf<{
	k1: ["v1", "v2"];
}>();

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
	Expect<Equal<ParseQueryString<"">, {}>>,
	Expect<Equal<ParseQueryString<"k1">, { k1: true }>>,
	Expect<Equal<ParseQueryString<"k1&k1">, { k1: true }>>,
	Expect<Equal<ParseQueryString<"k1&k2">, { k1: true; k2: true }>>,
	Expect<Equal<ParseQueryString<"k1=v1">, { k1: "v1" }>>,
	Expect<Equal<ParseQueryString<"k1=v1&k1=v2">, { k1: ["v1", "v2"] }>>,
	Expect<Equal<ParseQueryString<"k1=v1&k2=v2">, { k1: "v1"; k2: "v2" }>>,
	Expect<Equal<ParseQueryString<"k1=v1&k2=v2&k1=v2">, { k1: ["v1", "v2"]; k2: "v2" }>>,
	Expect<Equal<ParseQueryString<"k1=v1&k2">, { k1: "v1"; k2: true }>>,
	Expect<Equal<ParseQueryString<"k1=v1&k1=v1">, { k1: "v1" }>>,
	Expect<Equal<ParseQueryString<"k1=v1&k1=v2&k1=v1">, { k1: ["v1", "v2"] }>>,
	Expect<Equal<ParseQueryString<"k1=v1&k2=v1&k1=v2&k1=v1">, { k1: ["v1", "v2"]; k2: "v1" }>>,
	Expect<
		Equal<ParseQueryString<"k1=v1&k2=v2&k1=v2&k1=v3">, { k1: ["v1", "v2", "v3"]; k2: "v2" }>
	>,
	Expect<Equal<ParseQueryString<"k1=v1&k1">, { k1: ["v1", true] }>>,
	Expect<Equal<ParseQueryString<"k1&k1=v1">, { k1: [true, "v1"] }>>,
];

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/151/answer
  > View solutions: https://tsch.js.org/151/solutions
  > More Challenges: https://tsch.js.org
*/
