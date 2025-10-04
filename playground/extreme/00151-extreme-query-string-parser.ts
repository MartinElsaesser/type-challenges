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
	TParam extends "" ? never
	: TParam extends `${infer Key}=${infer Value}` ? { key: Key; value: Value }
	: { key: TParam; value: true };

type TokenValues = string | true;
type QueryParamToken = {
	key: string;
	value: TokenValues;
};
type Tokenizer<S extends string> =
	S extends `${infer W1}&${infer W2}` ? [TokenizeQueryParams<W1>, ...Tokenizer<W2>]
	:	[TokenizeQueryParams<S>];

type Parser<
	Tokens extends QueryParamToken[],
	Collect extends Record<string, TokenValues[] | TokenValues> = {},
> =
	Tokens extends [infer F extends QueryParamToken, ...infer R extends QueryParamToken[]] ?
		Parser<R, MergeTokenIntoParams<F, Collect>>
	:	Collect;

type ParseQueryString<S extends string> = Parser<Tokenizer<S>>;

type MergeTokenIntoParams<
	Token extends QueryParamToken,
	Params extends Record<string, TokenValues[] | TokenValues>,
> =
	[Token] extends [never] ? Params
	:	{
			[P in keyof Params | Token["key"]]: P extends keyof Params ?
				P extends Token["key"] ?
					// common key
					MergeValueIntoValues<Token["value"], Params[P]>
				:	// only keyof TArr
					Params[P]
			: P extends Token["key"] ?
				// only Token key
				Token["value"]
			:	never;
		};

type MergeValueIntoValues<Value extends TokenValues, Values extends TokenValues[] | TokenValues> =
	Values extends TokenValues[] ?
		// Values is an array
		Value extends Values[number] ?
			Values
		:	[...Values, Value]
	: // Values is not an array
	[Value, Values] extends [Values, Value] ? Values
	: [Values, Value];

type $MVIV<
	Token extends QueryParamToken,
	TArr extends Record<string, TokenValues | TokenValues[]>,
> = MergeTokenIntoParams<Token, TArr>;

// independent objects
expectTypeOf<{ k1: "v1"; k2: "v2"; k3: "v3" }>().toEqualTypeOf<
	MergeTokenIntoParams<{ key: "k2"; value: "v2" }, { k1: "v1"; k3: "v3" }>
>();
expectTypeOf<{ k2: "v2" }>().toEqualTypeOf<MergeTokenIntoParams<{ key: "k2"; value: "v2" }, {}>>();

// dependent objects: no duplicates
expectTypeOf<{ k1: ["v1", "v2"] }>().toEqualTypeOf<
	$MVIV<{ key: "k1"; value: "v2" }, { k1: "v1" }>
>();
expectTypeOf<{ k1: ["v0", "v1"] }>().toEqualTypeOf<
	$MVIV<{ key: "k1"; value: "v1" }, { k1: "v0" }>
>();

expectTypeOf<{
	k1: ["v1", "v2", "v3"];
}>().toEqualTypeOf<$MVIV<{ key: "k1"; value: "v3" }, { k1: ["v1", "v2"] }>>();

expectTypeOf<{
	k1: ["v1", "v2"];
}>().toEqualTypeOf<$MVIV<never, { k1: ["v1", "v2"] }>>();

// dependent objects: duplicates
expectTypeOf<{ k1: true }>().toEqualTypeOf<$MVIV<{ key: "k1"; value: true }, { k1: true }>>();
expectTypeOf<{ k1: [true, "false"] }>().toEqualTypeOf<
	$MVIV<{ key: "k1"; value: true }, { k1: [true, "false"] }>
>();
expectTypeOf<{ k1: "v1" }>().toEqualTypeOf<$MVIV<{ key: "k1"; value: "v1" }, { k1: "v1" }>>();
expectTypeOf<{
	k1: ["v1", "v2"];
}>().toEqualTypeOf<$MVIV<{ key: "k1"; value: "v1" }, { k1: ["v1", "v2"] }>>();

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
