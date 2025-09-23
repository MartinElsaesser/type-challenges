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

type TokenizeQueryParams<TParam extends string> =
	TParam extends "" ? {}
	: TParam extends `${infer Key}=${infer Value}` ? { [K in Key]: Value }
	: { [K in TParam]: true };

type Parser<S extends string, Collect extends Params = {}> =
	S extends `${infer W1}&${infer W2}` ? Parser<W2, MergeParams<TokenizeQueryParams<W1>, Collect>>
	:	MergeParams<TokenizeQueryParams<S>, Collect>;

type ParseQueryString<S extends string> = Parser<S>;

type TokenValues = string | true;

type Param = Record<string, TokenValues>;
type Params = Record<string, TokenValues[] | TokenValues>;
type MergeParams<TParam extends Param, TParams extends Params> = {
	[Key in keyof TParam | keyof TParams]: Key extends keyof TParam ?
		Key extends keyof TParams ?
			MergeValues<TParam[Key], TParams[Key]> // Key is a duplicate
		:	TParam[Key] // Key is not a duplicate
	: Key extends keyof TParams ?
		TParams[Key] // Key is not a duplicate
	:	never; // something went terribly wrong
};

type MergeValues<TParamVal extends TokenValues, TParamsVal extends TokenValues[] | TokenValues> =
	TParamsVal extends TokenValues[] ? MergeParamIntoParams<TParamVal, TParamsVal>
	:	MergeParamIntoParam<TParamVal, TParamsVal & TokenValues>;

type MergeParamIntoParams<TParamVal extends TokenValues, TParamsVal extends TokenValues[]> =
	TParamVal extends TParamsVal[number] ? TParamsVal : [...TParamsVal, TParamVal];
type MergeParamIntoParam<T2 extends TokenValues, T1 extends TokenValues> =
	[T2, T1] extends [T1, T2] ? T1 : [T1, T2];

type TMO<
	TObj extends Record<string, TokenValues>,
	TArr extends Record<string, TokenValues | TokenValues[]>,
> = MergeParams<TObj, TArr>;

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
