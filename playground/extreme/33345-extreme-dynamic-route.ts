/*
  33345 - Dynamic Route
  -------
  by 0753 (@0753Ljuc) #extreme

  ### Question

  Given below routes, infer its dynamic params.
  | Route                          | Params Type Definition                                                                                     |
  |--------------------------------|------------------------------------------------------------------------------------------------------------|
  | `/blog/[slug]/page.js`         | `{ slug: string }`                                                                                         |
  | `/shop/[...slug]/page.js`      | `{ slug: string[] }`                                                                                       |
  | `/shop/[[...slug]]/page.js`    | `{ slug?: string[] }`                                                                                      |
  | `/[categoryId]/[itemId]/page.js` | `{ categoryId: string, itemId: string }`                                                                 |
  | `/app/[...foo]/[...bar]`       | `never` - It's ambiguous as we cannot decide if `b` on `/app/a/b/c` is belongs to `foo` or `bar`.          |
  | `/[[...foo]]/[slug]/[...bar]`  | `never`                                                                                                    |
  | `/[first]/[[...foo]]/stub/[...bar]/[last]` | `{ first: string, foo?: string[], bar: string[], last: string }`                               |

  > View on GitHub: https://tsch.js.org/33345
*/

/* _____________ Your Code Here _____________ */
import { expectTypeOf } from "expect-type";

// Tokens
type StaticSegment = "StaticSegment"; // app
type SingleSegment = "SingleSegment"; // [slug], [...]
type OptSingleSegment = "OptSingleSegment"; // [[slug]], [[...]]
type MultiSegment = "MultiSegment"; // [...slug]
type OptMultiSegment = "OptMultiSegment"; // [[...slug]]
type KeyFromSlug<TSlug> = TSlug extends "" ? never : TSlug;
type TokenizeSegment<TStr extends string> =
	// special cases
	TStr extends `[[...]]` ? { token: OptSingleSegment; data: { "..."?: string } }
	: TStr extends `[...]` ? { token: SingleSegment; data: { "...": string } }
	: // begin of sensible cases
	TStr extends `[[...${infer Slug}]]` ?
		{ token: OptMultiSegment; data: { [K in KeyFromSlug<Slug>]?: string[] } }
	: TStr extends `[...${infer Slug}]` ?
		{ token: MultiSegment; data: { [K in KeyFromSlug<Slug>]: string[] } }
	: TStr extends `[[${infer Slug}]]` ?
		{ token: OptSingleSegment; data: { [K in KeyFromSlug<Slug>]?: string } }
	: TStr extends `[${infer Slug}]` ?
		{ token: SingleSegment; data: { [K in KeyFromSlug<Slug>]: string } }
	:	{ token: StaticSegment; data: {} };

expectTypeOf<TokenizeSegment<"[slug]">>().toEqualTypeOf<{
	token: SingleSegment;
	data: { slug: string };
}>();
expectTypeOf<TokenizeSegment<"[[slug]]">>().toEqualTypeOf<{
	token: OptSingleSegment;
	data: { slug?: string };
}>();
expectTypeOf<TokenizeSegment<"[...slug]">>().toEqualTypeOf<{
	token: MultiSegment;
	data: { slug: string[] };
}>();
expectTypeOf<TokenizeSegment<"[[...slug]]">>().toEqualTypeOf<{
	token: OptMultiSegment;
	data: { slug?: string[] };
}>();
expectTypeOf<TokenizeSegment<"slug">>().toEqualTypeOf<{ token: StaticSegment; data: {} }>();
expectTypeOf<TokenizeSegment<"[...]">>().toEqualTypeOf<{
	token: SingleSegment;
	data: { "...": string };
}>();
expectTypeOf<TokenizeSegment<"[[...]]">>().toEqualTypeOf<{
	token: OptSingleSegment;
	data: { "..."?: string };
}>();
expectTypeOf<TokenizeSegment<"[]">>().toEqualTypeOf<{
	token: SingleSegment;
	data: {};
}>();
expectTypeOf<TokenizeSegment<"shop">>().toEqualTypeOf<{
	token: StaticSegment;
	data: {};
}>();

type TokenizedSegment = TokenizeSegment<any>;

type TokenizePath<TPath extends string, TCollector extends any[] = []> =
	TPath extends `${infer Segment}/${infer RemainingPath}` ?
		TokenizePath<RemainingPath, [...TCollector, TokenizeSegment<Segment>]>
	:	[...TCollector, TokenizeSegment<TPath>];

type TokenizeUrl<TUrl extends string> =
	TUrl extends `/${infer PathSegment}` ? TokenizePath<PathSegment> : TokenizePath<TUrl>;
/**
 * stateDiagram-v2
    [*] --> start
    start --> start :StaticSegment, SingleSegment OptSingleSegment
    start --> multiSegmentRead :MultiSegment OptMultiSegment

    multiSegmentRead --> start :StaticSegment
    multiSegmentRead --> multiSegmentRead :SingleSegment OptSingleSegment
    multiSegmentRead --> error :MultiSegment OptMultiSegment
 */
type Parser$Start<TSegments extends TokenizedSegment[]> =
	TSegments extends (
		[
			infer TSegment extends TokenizedSegment,
			...infer TRemainingSegments extends TokenizedSegment[],
		]
	) ?
		TSegment["token"] extends StaticSegment ?
			Parser$Start<TRemainingSegments> & TSegment["data"]
		: TSegment["token"] extends SingleSegment ?
			Parser$Start<TRemainingSegments> & TSegment["data"]
		: TSegment["token"] extends OptSingleSegment ?
			Parser$Start<TRemainingSegments> & TSegment["data"]
		: TSegment["token"] extends MultiSegment ?
			Parser$MultiSegmentRead<TRemainingSegments> & TSegment["data"]
		: TSegment["token"] extends OptMultiSegment ?
			Parser$MultiSegmentRead<TRemainingSegments> & TSegment["data"]
		:	never // Error (should never happen)
	:	{}; // TSegments is empty

type Parser$MultiSegmentRead<TSegments extends TokenizedSegment[]> =
	TSegments extends (
		[
			infer TSegment extends TokenizedSegment,
			...infer TRemainingSegments extends TokenizedSegment[],
		]
	) ?
		TSegment["token"] extends StaticSegment ?
			Parser$Start<TRemainingSegments> & TSegment["data"]
		: TSegment["token"] extends SingleSegment ?
			Parser$MultiSegmentRead<TRemainingSegments> & TSegment["data"]
		: TSegment["token"] extends OptSingleSegment ?
			Parser$MultiSegmentRead<TRemainingSegments> & TSegment["data"]
		:	never // Error
	:	{}; // TSegments is empty

type Parser<T extends string> = Parser$Start<TokenizeUrl<T>>;
type tokens = TokenizeUrl<"/[slug]/[[...foo]]/[...bar]">;
type debug = Parser$Start<tokens>;

type JoinIntersections<T> = {
	[K in keyof T]: T[K];
};
type DynamicRoute<T extends string> = JoinIntersections<Parser<T>>;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
	Expect<Equal<DynamicRoute<"/shop">, {}>>,
	Expect<Equal<DynamicRoute<"/shop/[]">, {}>>,
	Expect<Equal<DynamicRoute<"/shop/[slug]">, { slug: string }>>,
	Expect<Equal<DynamicRoute<"/shop/[slug]/">, { slug: string }>>,
	Expect<Equal<DynamicRoute<"/shop/[slug]/[foo]">, { slug: string; foo: string }>>,
	Expect<Equal<DynamicRoute<"/shop/[slug]/stub/[foo]">, { slug: string; foo: string }>>,
	Expect<Equal<DynamicRoute<"/shop/[slug]/stub/[foo]">, { slug: string; foo: string }>>,
	Expect<Equal<DynamicRoute<"/shop/[slug]/stub/[...foo]">, { slug: string; foo: string[] }>>,
	Expect<Equal<DynamicRoute<"/shop/[slug]/stub/[[...foo]]">, { slug: string; foo?: string[] }>>,
	Expect<
		Equal<DynamicRoute<"/shop/[slug]/stub/[[...foo]]/[]">, { slug: string; foo?: string[] }>
	>,
	Expect<
		Equal<
			DynamicRoute<"/shop/[slug]/stub/[[...foo]]/[...]">,
			{ slug: string; foo?: string[]; "...": string }
		>
	>,
	Expect<
		Equal<
			DynamicRoute<"/shop/[slug]/stub/[[...foo]]/[...]/[]index.html">,
			{ slug: string; foo?: string[]; "...": string }
		>
	>,
	Expect<
		Equal<
			DynamicRoute<"/shop/[slug]/stub/[[...foo]]/[...]/[...]index.html">,
			{ slug: string; foo?: string[]; "...": string }
		>
	>,
	Expect<Equal<DynamicRoute<"/[slug]/[[...foo]]/[...bar]">, never>>,
	Expect<Equal<DynamicRoute<"/[[...foo]]/[slug]/[...bar]">, never>>,
	Expect<Equal<DynamicRoute<"/[[...foo]]/[...bar]/static">, never>>,
	Expect<Equal<DynamicRoute<"[[...foo]]/stub/[...bar]">, { foo?: string[]; bar: string[] }>>,
	Expect<
		Equal<
			DynamicRoute<"[first]/[[...foo]]/stub/[...bar]/[last]">,
			{ first: string; foo?: string[]; bar: string[]; last: string }
		>
	>,
];

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/33345/answer
  > View solutions: https://tsch.js.org/33345/solutions
  > More Challenges: https://tsch.js.org
*/
