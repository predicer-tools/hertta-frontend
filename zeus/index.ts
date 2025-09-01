/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const.js';
import fetch, { Response } from 'node-fetch';
import WebSocket from 'ws';


export const HOST="Specify host"


export const HEADERS = {}
export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query);
    const wsString = queryString.replace('http', 'ws');
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
	const webSocketOptions: websocketOptions = options[1]?.websocket ?? [host];
	const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error('No websockets implemented');
  }
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
  (query: string, variables: Record<string, unknown> = {}) => {
    const fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetch(`${options[0]}`, {
      body: JSON.stringify({ query, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...fetchOptions,
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

type UnionOverrideKeys<T, U> = Omit<T, keyof U> & U;

export const Thunder =
  <SCLR extends ScalarDefinition>(fn: FetchFunction, thunderGraphQLOptions?: ThunderGraphQLOptions<SCLR>) =>
  <O extends keyof typeof Ops, OVERRIDESCLR extends SCLR, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<OVERRIDESCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: Z & {
      [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
    },
    ops?: OperationOptions & { variables?: Record<string, unknown> },
  ) => {
    const options = {
      ...thunderGraphQLOptions,
      ...graphqlOptions,
    };
    return fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: options?.scalars,
      }),
      ops?.variables,
    ).then((data) => {
      if (options?.scalars) {
        return decodeScalarsInResponse({
          response: data,
          initialOp: operation,
          initialZeusQuery: o as VType,
          returns: ReturnTypes,
          scalars: options.scalars,
          ops: Ops,
        });
      }
      return data;
    }) as Promise<InputType<GraphQLTypes[R], Z, UnionOverrideKeys<SCLR, OVERRIDESCLR>>>;
  };

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  <SCLR extends ScalarDefinition>(fn: SubscriptionFunction, thunderGraphQLOptions?: ThunderGraphQLOptions<SCLR>) =>
  <O extends keyof typeof Ops, OVERRIDESCLR extends SCLR, R extends keyof ValueTypes = GenericOperation<O>>(
    operation: O,
    graphqlOptions?: ThunderGraphQLOptions<OVERRIDESCLR>,
  ) =>
  <Z extends ValueTypes[R]>(
    o: Z & {
      [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
    },
    ops?: OperationOptions & { variables?: ExtractVariables<Z> },
  ) => {
    const options = {
      ...thunderGraphQLOptions,
      ...graphqlOptions,
    };
    type CombinedSCLR = UnionOverrideKeys<SCLR, OVERRIDESCLR>;
    const returnedFunction = fn(
      Zeus(operation, o, {
        operationOptions: ops,
        scalars: options?.scalars,
      }),
    ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], CombinedSCLR>;
    if (returnedFunction?.on && options?.scalars) {
      const wrapped = returnedFunction.on;
      returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => void) =>
        wrapped((data: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => {
          if (options?.scalars) {
            return fnToCall(
              decodeScalarsInResponse({
                response: data,
                initialOp: operation,
                initialZeusQuery: o as VType,
                returns: ReturnTypes,
                scalars: options.scalars,
                ops: Ops,
              }),
            );
          }
          return fnToCall(data);
        });
    }
    return returnedFunction;
  };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: Z,
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

type BaseSymbol = number | string | undefined | boolean | null;

type ScalarsSelector<T> = {
  [X in Required<{
    [P in keyof T]: T[P] extends BaseSymbol | Array<BaseSymbol> ? P : never;
  }>[keyof T]]: true;
};

export const fields = <T extends keyof ModelTypes>(k: T) => {
  const t = ReturnTypes[k];
  const fnType = k in AllTypesProps ? AllTypesProps[k as keyof typeof AllTypesProps] : undefined;
  const hasFnTypes = typeof fnType === 'object' ? fnType : undefined;
  const o = Object.fromEntries(
    Object.entries(t)
      .filter(([k, value]) => {
        const isFunctionType = hasFnTypes && k in hasFnTypes && !!hasFnTypes[k as keyof typeof hasFnTypes];
        if (isFunctionType) return false;
        const isReturnType = ReturnTypes[value as string];
        if (!isReturnType) return true;
        if (typeof isReturnType !== 'string') return false;
        if (isReturnType.startsWith('scalar.')) {
          return true;
        }
        return false;
      })
      .map(([key]) => [key, true as const]),
  );
  return o as ScalarsSelector<ModelTypes[T]>;
};

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | `scalar.${string}`
    | 'enum'
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | `scalar.${string}`
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
    ? SCLR[T]['decode'] extends (s: unknown) => unknown
      ? ReturnType<SCLR[T]['decode']>
      : unknown
    : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
          : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : Record<string, never>, SCLR>
        : never;
    }[keyof SRC] & {
      [P in keyof Omit<
        Pick<
          SRC,
          {
            [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
          }[keyof DST]
        >,
        '__typename'
      >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
    }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
        ? IsScalar<SRC[P], SCLR>
        : IsArray<SRC[P], DST[P], SCLR>;
    };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
    } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <Z extends V>(
  t: Z & {
    [P in keyof Z]: P extends keyof V ? Z[P] : never;
  },
) => Z;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['ID']: unknown;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
    ? R2 extends VR<infer R3>
      ? R3 extends VR<infer R4>
        ? R4 extends VR<infer R5>
          ? R5
          : R4
        : R3
      : R2
    : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariablesDeep<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariablesDeep<Query[K]>> }[keyof Query]>;

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariablesDeep<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never
export type ScalarCoders = {
	DateTime?: ScalarResolver;
}
type ZEUS_UNIONS = GraphQLTypes["Forecastable"] | GraphQLTypes["JobOutcome"] | GraphQLTypes["NodeOrProcess"] | GraphQLTypes["SeriesValue"] | GraphQLTypes["SettingsResult"] | GraphQLTypes["TimeLineStart"]

export type ValueTypes = {
    /** Represents predefined clock options. */
["Clock"]:Clock;
	["ConstraintFactorType"]:ConstraintFactorType;
	["ConstraintType"]:ConstraintType;
	["Conversion"]:Conversion;
	["JobState"]:JobState;
	["MarketDirection"]:MarketDirection;
	["MarketType"]:MarketType;
	["DurationInput"]: {
	hours: number | Variable<any, string>,
	minutes: number | Variable<any, string>,
	seconds: number | Variable<any, string>
};
	["ForecastValueInput"]: {
	scenario?: string | undefined | null | Variable<any, string>,
	constant?: number | undefined | null | Variable<any, string>,
	series?: Array<number> | undefined | null | Variable<any, string>,
	forecast?: string | undefined | null | Variable<any, string>
};
	["InputDataSetupUpdate"]: {
	containsReserves?: boolean | undefined | null | Variable<any, string>,
	containsOnline?: boolean | undefined | null | Variable<any, string>,
	containsStates?: boolean | undefined | null | Variable<any, string>,
	containsPiecewiseEff?: boolean | undefined | null | Variable<any, string>,
	containsRisk?: boolean | undefined | null | Variable<any, string>,
	containsDiffusion?: boolean | undefined | null | Variable<any, string>,
	containsDelay?: boolean | undefined | null | Variable<any, string>,
	containsMarkets?: boolean | undefined | null | Variable<any, string>,
	reserveRealization?: boolean | undefined | null | Variable<any, string>,
	useMarketBids?: boolean | undefined | null | Variable<any, string>,
	commonTimesteps?: number | undefined | null | Variable<any, string>,
	commonScenarioName?: string | undefined | null | Variable<any, string>,
	useNodeDummyVariables?: boolean | undefined | null | Variable<any, string>,
	useRampDummyVariables?: boolean | undefined | null | Variable<any, string>,
	nodeDummyVariableCost?: number | undefined | null | Variable<any, string>,
	rampDummyVariableCost?: number | undefined | null | Variable<any, string>
};
	/** Location input. */
["LocationInput"]: {
	/** Country. */
	country?: string | undefined | null | Variable<any, string>,
	/** Place within the country. */
	place?: string | undefined | null | Variable<any, string>
};
	["NewGenConstraint"]: {
	name: string | Variable<any, string>,
	gcType: ValueTypes["ConstraintType"] | Variable<any, string>,
	isSetpoint: boolean | Variable<any, string>,
	penalty: number | Variable<any, string>,
	constant: Array<ValueTypes["ValueInput"]> | Variable<any, string>
};
	["NewMarket"]: {
	name: string | Variable<any, string>,
	mType: ValueTypes["MarketType"] | Variable<any, string>,
	node: string | Variable<any, string>,
	processGroup: string | Variable<any, string>,
	direction?: ValueTypes["MarketDirection"] | undefined | null | Variable<any, string>,
	realisation?: number | undefined | null | Variable<any, string>,
	reserveType?: string | undefined | null | Variable<any, string>,
	isBid: boolean | Variable<any, string>,
	isLimited: boolean | Variable<any, string>,
	minBid: number | Variable<any, string>,
	maxBid: number | Variable<any, string>,
	fee: number | Variable<any, string>,
	price: Array<ValueTypes["ForecastValueInput"]> | Variable<any, string>,
	upPrice: Array<ValueTypes["ForecastValueInput"]> | Variable<any, string>,
	downPrice: Array<ValueTypes["ForecastValueInput"]> | Variable<any, string>,
	reserveActivationPrice: Array<ValueTypes["ValueInput"]> | Variable<any, string>
};
	["NewNode"]: {
	name: string | Variable<any, string>,
	isCommodity: boolean | Variable<any, string>,
	isMarket: boolean | Variable<any, string>,
	isRes: boolean | Variable<any, string>,
	cost: Array<ValueTypes["ValueInput"]> | Variable<any, string>,
	inflow?: number | undefined | null | Variable<any, string>
};
	["NewNodeDelay"]: {
	fromNode: string | Variable<any, string>,
	toNode: string | Variable<any, string>,
	delay: number | Variable<any, string>,
	minDelayFlow: number | Variable<any, string>,
	maxDelayFlow: number | Variable<any, string>
};
	["NewNodeDiffusion"]: {
	fromNode: string | Variable<any, string>,
	toNode: string | Variable<any, string>,
	coefficient: Array<ValueTypes["ValueInput"]> | Variable<any, string>
};
	["NewProcess"]: {
	name: string | Variable<any, string>,
	conversion: ValueTypes["Conversion"] | Variable<any, string>,
	isCfFix: boolean | Variable<any, string>,
	isOnline: boolean | Variable<any, string>,
	isRes: boolean | Variable<any, string>,
	eff: number | Variable<any, string>,
	loadMin: number | Variable<any, string>,
	loadMax: number | Variable<any, string>,
	startCost: number | Variable<any, string>,
	minOnline: number | Variable<any, string>,
	maxOnline: number | Variable<any, string>,
	minOffline: number | Variable<any, string>,
	maxOffline: number | Variable<any, string>,
	initialState: boolean | Variable<any, string>,
	isScenarioIndependent: boolean | Variable<any, string>,
	cf: Array<ValueTypes["ValueInput"]> | Variable<any, string>,
	effTs: Array<ValueTypes["ValueInput"]> | Variable<any, string>
};
	["NewRisk"]: {
	parameter: string | Variable<any, string>,
	value: number | Variable<any, string>
};
	["NewSeries"]: {
	scenario: string | Variable<any, string>,
	durations: Array<ValueTypes["DurationInput"]> | Variable<any, string>,
	values: Array<number> | Variable<any, string>
};
	["NewTopology"]: {
	capacity: number | Variable<any, string>,
	vomCost: number | Variable<any, string>,
	rampUp: number | Variable<any, string>,
	rampDown: number | Variable<any, string>,
	initialLoad: number | Variable<any, string>,
	initialFlow: number | Variable<any, string>,
	capTs: Array<ValueTypes["ValueInput"]> | Variable<any, string>
};
	["SettingsInput"]: {
	location?: ValueTypes["LocationInput"] | undefined | null | Variable<any, string>
};
	["StateInput"]: {
	inMax: number | Variable<any, string>,
	outMax: number | Variable<any, string>,
	stateLossProportional: number | Variable<any, string>,
	stateMin: number | Variable<any, string>,
	stateMax: number | Variable<any, string>,
	initialState: number | Variable<any, string>,
	isScenarioIndependent: boolean | Variable<any, string>,
	isTemp: boolean | Variable<any, string>,
	tEConversion: number | Variable<any, string>,
	residualValue: number | Variable<any, string>
};
	["StateUpdate"]: {
	inMax?: number | undefined | null | Variable<any, string>,
	outMax?: number | undefined | null | Variable<any, string>,
	stateLossProportional?: number | undefined | null | Variable<any, string>,
	stateMax?: number | undefined | null | Variable<any, string>,
	stateMin?: number | undefined | null | Variable<any, string>,
	initialState?: number | undefined | null | Variable<any, string>,
	isScenarioIndependent?: boolean | undefined | null | Variable<any, string>,
	isTemp?: boolean | undefined | null | Variable<any, string>,
	tEConversion?: number | undefined | null | Variable<any, string>,
	residualValue?: number | undefined | null | Variable<any, string>
};
	["TimeLineUpdate"]: {
	duration?: ValueTypes["DurationInput"] | undefined | null | Variable<any, string>,
	step?: ValueTypes["DurationInput"] | undefined | null | Variable<any, string>
};
	["ValueInput"]: {
	scenario?: string | undefined | null | Variable<any, string>,
	constant?: number | undefined | null | Variable<any, string>,
	series?: Array<number> | undefined | null | Variable<any, string>
};
	/** Combined date and time (with time zone) in [RFC 3339][0] format.

Represents a description of an exact instant on the time-line (such as the
instant that a user account was created).

[`DateTime` scalar][1] compliant.

See also [`chrono::DateTime`][2] for details.

[0]: https://datatracker.ietf.org/doc/html/rfc3339#section-5
[1]: https://graphql-scalars.dev/docs/scalars/date-time
[2]: https://docs.rs/chrono/latest/chrono/struct.DateTime.html */
["DateTime"]:unknown;
	/** Defines a clock-based start time. */
["ClockChoice"]: AliasType<{
	/** Predefined clock option. */
	choice?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ConFactor"]: AliasType<{
	varType?:boolean | `@${string}`,
	varTuple?:ValueTypes["VariableId"],
	data?:ValueTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	["Constant"]: AliasType<{
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ControlSignal"]: AliasType<{
	name?:boolean | `@${string}`,
	signal?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents a user-defined start time. */
["CustomStartTime"]: AliasType<{
	/** User-provided start time (ISO 8601). */
	startTime?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Delay for connections between nodes. */
["Delay"]: AliasType<{
	fromNode?:ValueTypes["Node"],
	toNode?:ValueTypes["Node"],
	delay?:boolean | `@${string}`,
	minDelayFlow?:boolean | `@${string}`,
	maxDelayFlow?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Duration"]: AliasType<{
	hours?:boolean | `@${string}`,
	minutes?:boolean | `@${string}`,
	seconds?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ElectricityPriceOutcome"]: AliasType<{
	time?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["FloatList"]: AliasType<{
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Forecast"]: AliasType<{
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ForecastValue"]: AliasType<{
	scenario?:boolean | `@${string}`,
	value?:ValueTypes["Forecastable"],
		__typename?: boolean | `@${string}`
}>;
	["GenConstraint"]: AliasType<{
	name?:boolean | `@${string}`,
	gcType?:boolean | `@${string}`,
	isSetpoint?:boolean | `@${string}`,
	penalty?:boolean | `@${string}`,
	factors?:ValueTypes["ConFactor"],
	constant?:ValueTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	["InflowBlock"]: AliasType<{
	name?:boolean | `@${string}`,
	node?:ValueTypes["Node"],
	data?:ValueTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	/** The model itself. */
["InputData"]: AliasType<{
	scenarios?:ValueTypes["Scenario"],
	setup?:ValueTypes["InputDataSetup"],
	processes?:ValueTypes["Process"],
	nodes?:ValueTypes["Node"],
	nodeDiffusion?:ValueTypes["NodeDiffusion"],
	nodeDelay?:ValueTypes["Delay"],
	nodeHistories?:ValueTypes["NodeHistory"],
	markets?:ValueTypes["Market"],
	nodeGroups?:ValueTypes["NodeGroup"],
	processGroups?:ValueTypes["ProcessGroup"],
	reserveType?:ValueTypes["ReserveType"],
	risk?:ValueTypes["Risk"],
	inflowBlocks?:ValueTypes["InflowBlock"],
	genConstraints?:ValueTypes["GenConstraint"],
		__typename?: boolean | `@${string}`
}>;
	["InputDataSetup"]: AliasType<{
	containsReserves?:boolean | `@${string}`,
	containOnline?:boolean | `@${string}`,
	containsStates?:boolean | `@${string}`,
	containsPiecewiseEff?:boolean | `@${string}`,
	containsRisk?:boolean | `@${string}`,
	containsDiffusion?:boolean | `@${string}`,
	containsDelay?:boolean | `@${string}`,
	containsMarkets?:boolean | `@${string}`,
	reserveRealisation?:boolean | `@${string}`,
	useMarketBids?:boolean | `@${string}`,
	commonTimeSteps?:boolean | `@${string}`,
	commonScenario?:ValueTypes["Scenario"],
	useNodeDummyVariables?:boolean | `@${string}`,
	useRampDummyVariables?:boolean | `@${string}`,
	nodeDummyVariableCost?:boolean | `@${string}`,
	rampDummyVariableCost?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["JobStatus"]: AliasType<{
	state?:boolean | `@${string}`,
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["LocationSettings"]: AliasType<{
	/** Country. */
	country?:boolean | `@${string}`,
	/** Place within country. */
	place?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Market"]: AliasType<{
	name?:boolean | `@${string}`,
	mType?:boolean | `@${string}`,
	node?:ValueTypes["Node"],
	processGroup?:ValueTypes["ProcessGroup"],
	direction?:boolean | `@${string}`,
	realisation?:boolean | `@${string}`,
	reserveType?:ValueTypes["ReserveType"],
	isBid?:boolean | `@${string}`,
	isLimited?:boolean | `@${string}`,
	minBid?:boolean | `@${string}`,
	maxBid?:boolean | `@${string}`,
	fee?:boolean | `@${string}`,
	price?:ValueTypes["ForecastValue"],
	upPrice?:ValueTypes["ForecastValue"],
	downPrice?:ValueTypes["ForecastValue"],
	reserveActivationPrice?:ValueTypes["Value"],
	fixed?:ValueTypes["MarketFix"],
		__typename?: boolean | `@${string}`
}>;
	["MarketFix"]: AliasType<{
	name?:boolean | `@${string}`,
	factor?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["MaybeError"]: AliasType<{
	/** Error message; if null, the operation succeeded. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Optimization model. */
["Model"]: AliasType<{
	timeLine?:ValueTypes["TimeLineSettings"],
	inputData?:ValueTypes["InputData"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	/** Start optimization job. Return job ID. */
	startOptimization?:boolean | `@${string}`,
	/** Start electricity price fetch job. Return job ID. */
	startElectricityPriceFetch?:boolean | `@${string}`,
	/** Start weather forecast job. Return job ID. */
	startWeatherForecastFetch?:boolean | `@${string}`,
updateTimeLine?: [{	timeLineInput: ValueTypes["TimeLineUpdate"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
createScenario?: [{	name: string | Variable<any, string>,	weight: number | Variable<any, string>},ValueTypes["MaybeError"]],
deleteScenario?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
	/** Save the model on disk. */
	saveModel?:ValueTypes["MaybeError"],
	/** Clear input data from model. */
	clearInputData?:ValueTypes["MaybeError"],
updateInputDataSetup?: [{	setupUpdate: ValueTypes["InputDataSetupUpdate"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
createNodeGroup?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
createProcessGroup?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
deleteGroup?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
createProcess?: [{	process: ValueTypes["NewProcess"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
addProcessToGroup?: [{	processName: string | Variable<any, string>,	groupName: string | Variable<any, string>},ValueTypes["MaybeError"]],
deleteProcess?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
createTopology?: [{	topology: ValueTypes["NewTopology"] | Variable<any, string>,	sourceNodeName?: string | undefined | null | Variable<any, string>,	processName: string | Variable<any, string>,	sinkNodeName?: string | undefined | null | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteTopology?: [{	sourceNodeName?: string | undefined | null | Variable<any, string>,	processName: string | Variable<any, string>,	sinkNodeName?: string | undefined | null | Variable<any, string>},ValueTypes["MaybeError"]],
createNode?: [{	node: ValueTypes["NewNode"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
addNodeToGroup?: [{	nodeName: string | Variable<any, string>,	groupName: string | Variable<any, string>},ValueTypes["MaybeError"]],
setNodeState?: [{	state?: ValueTypes["StateInput"] | undefined | null | Variable<any, string>,	nodeName: string | Variable<any, string>},ValueTypes["ValidationErrors"]],
updateNodeState?: [{	state: ValueTypes["StateUpdate"] | Variable<any, string>,	nodeName: string | Variable<any, string>},ValueTypes["ValidationErrors"]],
connectNodeInflowToTemperatureForecast?: [{	nodeName: string | Variable<any, string>,	forecastName: string | Variable<any, string>},ValueTypes["MaybeError"]],
deleteNode?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
createNodeDiffusion?: [{	newDiffusion: ValueTypes["NewNodeDiffusion"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteNodeDiffusion?: [{	fromNode: string | Variable<any, string>,	toNode: string | Variable<any, string>},ValueTypes["MaybeError"]],
createNodeDelay?: [{	delay: ValueTypes["NewNodeDelay"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteNodeDelay?: [{	fromNode: string | Variable<any, string>,	toNode: string | Variable<any, string>},ValueTypes["MaybeError"]],
createNodeHistory?: [{	nodeName: string | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteNodeHistory?: [{	nodeName: string | Variable<any, string>},ValueTypes["MaybeError"]],
addStepToNodeHistory?: [{	nodeName: string | Variable<any, string>,	step: ValueTypes["NewSeries"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
clearNodeHistorySteps?: [{	nodeName: string | Variable<any, string>},ValueTypes["MaybeError"]],
createMarket?: [{	market: ValueTypes["NewMarket"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
connectMarketPricesToForecast?: [{	marketName: string | Variable<any, string>,	forecastName: string | Variable<any, string>},ValueTypes["MaybeError"]],
deleteMarket?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
createRisk?: [{	risk: ValueTypes["NewRisk"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteRisk?: [{	parameter: string | Variable<any, string>},ValueTypes["MaybeError"]],
createGenConstraint?: [{	constraint: ValueTypes["NewGenConstraint"] | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteGenConstraint?: [{	name: string | Variable<any, string>},ValueTypes["MaybeError"]],
createFlowConFactor?: [{	factor: Array<ValueTypes["ValueInput"]> | Variable<any, string>,	constraintName: string | Variable<any, string>,	processName: string | Variable<any, string>,	sourceOrSinkNodeName: string | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteFlowConFactor?: [{	constraintName: string | Variable<any, string>,	processName: string | Variable<any, string>,	sourceOrSinkNodeName: string | Variable<any, string>},ValueTypes["MaybeError"]],
createStateConFactor?: [{	factor: Array<ValueTypes["ValueInput"]> | Variable<any, string>,	constraintName: string | Variable<any, string>,	nodeName: string | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteStateConFactor?: [{	constraintName: string | Variable<any, string>,	nodeName: string | Variable<any, string>},ValueTypes["MaybeError"]],
createOnlineConFactor?: [{	factor: Array<ValueTypes["ValueInput"]> | Variable<any, string>,	constraintName: string | Variable<any, string>,	processName: string | Variable<any, string>},ValueTypes["ValidationErrors"]],
deleteOnlineConFactor?: [{	constraintName: string | Variable<any, string>,	processName: string | Variable<any, string>},ValueTypes["MaybeError"]],
updateSettings?: [{	settingsInput: ValueTypes["SettingsInput"] | Variable<any, string>},ValueTypes["SettingsResult"]],
		__typename?: boolean | `@${string}`
}>;
	["Node"]: AliasType<{
	name?:boolean | `@${string}`,
	groups?:ValueTypes["NodeGroup"],
	isCommodity?:boolean | `@${string}`,
	isMarket?:boolean | `@${string}`,
	isRes?:boolean | `@${string}`,
	state?:ValueTypes["State"],
	cost?:ValueTypes["Value"],
	inflow?:ValueTypes["Forecastable"],
		__typename?: boolean | `@${string}`
}>;
	["NodeDiffusion"]: AliasType<{
	fromNode?:ValueTypes["Node"],
	toNode?:ValueTypes["Node"],
	coefficient?:ValueTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	["NodeGroup"]: AliasType<{
	name?:boolean | `@${string}`,
	members?:ValueTypes["Node"],
		__typename?: boolean | `@${string}`
}>;
	["NodeHistory"]: AliasType<{
	node?:ValueTypes["Node"],
	steps?:ValueTypes["Series"],
		__typename?: boolean | `@${string}`
}>;
	["OptimizationOutcome"]: AliasType<{
	time?:boolean | `@${string}`,
	controlSignals?:ValueTypes["ControlSignal"],
		__typename?: boolean | `@${string}`
}>;
	["Point"]: AliasType<{
	x?:boolean | `@${string}`,
	y?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Process"]: AliasType<{
	name?:boolean | `@${string}`,
	groups?:ValueTypes["ProcessGroup"],
	conversion?:boolean | `@${string}`,
	isCf?:boolean | `@${string}`,
	isCfFix?:boolean | `@${string}`,
	isOnline?:boolean | `@${string}`,
	isRes?:boolean | `@${string}`,
	eff?:boolean | `@${string}`,
	loadMin?:boolean | `@${string}`,
	loadMax?:boolean | `@${string}`,
	startCost?:boolean | `@${string}`,
	minOnline?:boolean | `@${string}`,
	minOffline?:boolean | `@${string}`,
	maxOnline?:boolean | `@${string}`,
	maxOffline?:boolean | `@${string}`,
	isScenarioIndependent?:boolean | `@${string}`,
	topos?:ValueTypes["Topology"],
	cf?:ValueTypes["Value"],
	effTs?:ValueTypes["Value"],
	effOps?:boolean | `@${string}`,
	effFun?:ValueTypes["Point"],
		__typename?: boolean | `@${string}`
}>;
	["ProcessGroup"]: AliasType<{
	name?:boolean | `@${string}`,
	members?:ValueTypes["Process"],
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
	settings?:ValueTypes["Settings"],
	model?:ValueTypes["Model"],
genConstraint?: [{	name: string | Variable<any, string>},ValueTypes["GenConstraint"]],
nodeGroup?: [{	name: string | Variable<any, string>},ValueTypes["NodeGroup"]],
nodesInGroup?: [{	name: string | Variable<any, string>},ValueTypes["Node"]],
processGroup?: [{	name: string | Variable<any, string>},ValueTypes["ProcessGroup"]],
processesInGroup?: [{	name: string | Variable<any, string>},ValueTypes["Process"]],
market?: [{	name: string | Variable<any, string>},ValueTypes["Market"]],
node?: [{	name: string | Variable<any, string>},ValueTypes["Node"]],
groupsForNode?: [{	name: string | Variable<any, string>},ValueTypes["NodeGroup"]],
nodeDiffusion?: [{	fromNode: string | Variable<any, string>,	toNode: string | Variable<any, string>},ValueTypes["NodeDiffusion"]],
groupsForProcess?: [{	name: string | Variable<any, string>},ValueTypes["ProcessGroup"]],
process?: [{	name: string | Variable<any, string>},ValueTypes["Process"]],
conFactorsForProcess?: [{	name: string | Variable<any, string>},ValueTypes["ConFactor"]],
scenario?: [{	name: string | Variable<any, string>},ValueTypes["Scenario"]],
jobStatus?: [{	jobId: number | Variable<any, string>},ValueTypes["JobStatus"]],
jobOutcome?: [{	jobId: number | Variable<any, string>},ValueTypes["JobOutcome"]],
		__typename?: boolean | `@${string}`
}>;
	["ReserveType"]: AliasType<{
	name?:boolean | `@${string}`,
	rampRate?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Risk"]: AliasType<{
	parameter?:boolean | `@${string}`,
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Scenario for stochastics. */
["Scenario"]: AliasType<{
	/** Scenario name. */
	name?:boolean | `@${string}`,
	/** Scenario weight. */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Series"]: AliasType<{
	scenario?:boolean | `@${string}`,
	durations?:ValueTypes["Duration"],
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** General Hertta settings. */
["Settings"]: AliasType<{
	/** Device location. */
	location?:ValueTypes["LocationSettings"],
		__typename?: boolean | `@${string}`
}>;
	["State"]: AliasType<{
	inMax?:boolean | `@${string}`,
	outMax?:boolean | `@${string}`,
	stateLossProportional?:boolean | `@${string}`,
	stateMax?:boolean | `@${string}`,
	stateMin?:boolean | `@${string}`,
	initialState?:boolean | `@${string}`,
	isScenarioIndependent?:boolean | `@${string}`,
	isTemp?:boolean | `@${string}`,
	tEConversion?:boolean | `@${string}`,
	residualValue?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Optimization time line settings. */
["TimeLineSettings"]: AliasType<{
	/** Time line duration. */
	duration?:ValueTypes["Duration"],
	/** Time step length. */
	step?:ValueTypes["Duration"],
	/** Start of the time line. */
	start?:ValueTypes["TimeLineStart"],
		__typename?: boolean | `@${string}`
}>;
	["Topology"]: AliasType<{
	source?:ValueTypes["NodeOrProcess"],
	sink?:ValueTypes["NodeOrProcess"],
		__typename?: boolean | `@${string}`
}>;
	["ValidationError"]: AliasType<{
	field?:boolean | `@${string}`,
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ValidationErrors"]: AliasType<{
	errors?:ValueTypes["ValidationError"],
		__typename?: boolean | `@${string}`
}>;
	["Value"]: AliasType<{
	scenario?:boolean | `@${string}`,
	value?:ValueTypes["SeriesValue"],
		__typename?: boolean | `@${string}`
}>;
	["VariableId"]: AliasType<{
	entity?:ValueTypes["NodeOrProcess"],
	identifier?:ValueTypes["Node"],
		__typename?: boolean | `@${string}`
}>;
	["WeatherForecastOutcome"]: AliasType<{
	time?:boolean | `@${string}`,
	temperature?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Forecastable"]: AliasType<{		["...on Constant"]?: ValueTypes["Constant"],
		["...on FloatList"]?: ValueTypes["FloatList"],
		["...on Forecast"]?: ValueTypes["Forecast"]
		__typename?: boolean | `@${string}`
}>;
	["JobOutcome"]: AliasType<{		["...on ElectricityPriceOutcome"]?: ValueTypes["ElectricityPriceOutcome"],
		["...on OptimizationOutcome"]?: ValueTypes["OptimizationOutcome"],
		["...on WeatherForecastOutcome"]?: ValueTypes["WeatherForecastOutcome"]
		__typename?: boolean | `@${string}`
}>;
	["NodeOrProcess"]: AliasType<{		["...on Node"]?: ValueTypes["Node"],
		["...on Process"]?: ValueTypes["Process"]
		__typename?: boolean | `@${string}`
}>;
	["SeriesValue"]: AliasType<{		["...on Constant"]?: ValueTypes["Constant"],
		["...on FloatList"]?: ValueTypes["FloatList"]
		__typename?: boolean | `@${string}`
}>;
	["SettingsResult"]: AliasType<{		["...on Settings"]?: ValueTypes["Settings"],
		["...on ValidationErrors"]?: ValueTypes["ValidationErrors"]
		__typename?: boolean | `@${string}`
}>;
	/** Defines the start of the time line. */
["TimeLineStart"]: AliasType<{		["...on ClockChoice"]?: ValueTypes["ClockChoice"],
		["...on CustomStartTime"]?: ValueTypes["CustomStartTime"]
		__typename?: boolean | `@${string}`
}>
  }

export type ResolverInputTypes = {
    ["schema"]: AliasType<{
	query?:ResolverInputTypes["Query"],
	mutation?:ResolverInputTypes["Mutation"],
		__typename?: boolean | `@${string}`
}>;
	/** Represents predefined clock options. */
["Clock"]:Clock;
	["ConstraintFactorType"]:ConstraintFactorType;
	["ConstraintType"]:ConstraintType;
	["Conversion"]:Conversion;
	["JobState"]:JobState;
	["MarketDirection"]:MarketDirection;
	["MarketType"]:MarketType;
	["DurationInput"]: {
	hours: number,
	minutes: number,
	seconds: number
};
	["ForecastValueInput"]: {
	scenario?: string | undefined | null,
	constant?: number | undefined | null,
	series?: Array<number> | undefined | null,
	forecast?: string | undefined | null
};
	["InputDataSetupUpdate"]: {
	containsReserves?: boolean | undefined | null,
	containsOnline?: boolean | undefined | null,
	containsStates?: boolean | undefined | null,
	containsPiecewiseEff?: boolean | undefined | null,
	containsRisk?: boolean | undefined | null,
	containsDiffusion?: boolean | undefined | null,
	containsDelay?: boolean | undefined | null,
	containsMarkets?: boolean | undefined | null,
	reserveRealization?: boolean | undefined | null,
	useMarketBids?: boolean | undefined | null,
	commonTimesteps?: number | undefined | null,
	commonScenarioName?: string | undefined | null,
	useNodeDummyVariables?: boolean | undefined | null,
	useRampDummyVariables?: boolean | undefined | null,
	nodeDummyVariableCost?: number | undefined | null,
	rampDummyVariableCost?: number | undefined | null
};
	/** Location input. */
["LocationInput"]: {
	/** Country. */
	country?: string | undefined | null,
	/** Place within the country. */
	place?: string | undefined | null
};
	["NewGenConstraint"]: {
	name: string,
	gcType: ResolverInputTypes["ConstraintType"],
	isSetpoint: boolean,
	penalty: number,
	constant: Array<ResolverInputTypes["ValueInput"]>
};
	["NewMarket"]: {
	name: string,
	mType: ResolverInputTypes["MarketType"],
	node: string,
	processGroup: string,
	direction?: ResolverInputTypes["MarketDirection"] | undefined | null,
	realisation?: number | undefined | null,
	reserveType?: string | undefined | null,
	isBid: boolean,
	isLimited: boolean,
	minBid: number,
	maxBid: number,
	fee: number,
	price: Array<ResolverInputTypes["ForecastValueInput"]>,
	upPrice: Array<ResolverInputTypes["ForecastValueInput"]>,
	downPrice: Array<ResolverInputTypes["ForecastValueInput"]>,
	reserveActivationPrice: Array<ResolverInputTypes["ValueInput"]>
};
	["NewNode"]: {
	name: string,
	isCommodity: boolean,
	isMarket: boolean,
	isRes: boolean,
	cost: Array<ResolverInputTypes["ValueInput"]>,
	inflow?: number | undefined | null
};
	["NewNodeDelay"]: {
	fromNode: string,
	toNode: string,
	delay: number,
	minDelayFlow: number,
	maxDelayFlow: number
};
	["NewNodeDiffusion"]: {
	fromNode: string,
	toNode: string,
	coefficient: Array<ResolverInputTypes["ValueInput"]>
};
	["NewProcess"]: {
	name: string,
	conversion: ResolverInputTypes["Conversion"],
	isCfFix: boolean,
	isOnline: boolean,
	isRes: boolean,
	eff: number,
	loadMin: number,
	loadMax: number,
	startCost: number,
	minOnline: number,
	maxOnline: number,
	minOffline: number,
	maxOffline: number,
	initialState: boolean,
	isScenarioIndependent: boolean,
	cf: Array<ResolverInputTypes["ValueInput"]>,
	effTs: Array<ResolverInputTypes["ValueInput"]>
};
	["NewRisk"]: {
	parameter: string,
	value: number
};
	["NewSeries"]: {
	scenario: string,
	durations: Array<ResolverInputTypes["DurationInput"]>,
	values: Array<number>
};
	["NewTopology"]: {
	capacity: number,
	vomCost: number,
	rampUp: number,
	rampDown: number,
	initialLoad: number,
	initialFlow: number,
	capTs: Array<ResolverInputTypes["ValueInput"]>
};
	["SettingsInput"]: {
	location?: ResolverInputTypes["LocationInput"] | undefined | null
};
	["StateInput"]: {
	inMax: number,
	outMax: number,
	stateLossProportional: number,
	stateMin: number,
	stateMax: number,
	initialState: number,
	isScenarioIndependent: boolean,
	isTemp: boolean,
	tEConversion: number,
	residualValue: number
};
	["StateUpdate"]: {
	inMax?: number | undefined | null,
	outMax?: number | undefined | null,
	stateLossProportional?: number | undefined | null,
	stateMax?: number | undefined | null,
	stateMin?: number | undefined | null,
	initialState?: number | undefined | null,
	isScenarioIndependent?: boolean | undefined | null,
	isTemp?: boolean | undefined | null,
	tEConversion?: number | undefined | null,
	residualValue?: number | undefined | null
};
	["TimeLineUpdate"]: {
	duration?: ResolverInputTypes["DurationInput"] | undefined | null,
	step?: ResolverInputTypes["DurationInput"] | undefined | null
};
	["ValueInput"]: {
	scenario?: string | undefined | null,
	constant?: number | undefined | null,
	series?: Array<number> | undefined | null
};
	/** Combined date and time (with time zone) in [RFC 3339][0] format.

Represents a description of an exact instant on the time-line (such as the
instant that a user account was created).

[`DateTime` scalar][1] compliant.

See also [`chrono::DateTime`][2] for details.

[0]: https://datatracker.ietf.org/doc/html/rfc3339#section-5
[1]: https://graphql-scalars.dev/docs/scalars/date-time
[2]: https://docs.rs/chrono/latest/chrono/struct.DateTime.html */
["DateTime"]:unknown;
	/** Defines a clock-based start time. */
["ClockChoice"]: AliasType<{
	/** Predefined clock option. */
	choice?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ConFactor"]: AliasType<{
	varType?:boolean | `@${string}`,
	varTuple?:ResolverInputTypes["VariableId"],
	data?:ResolverInputTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	["Constant"]: AliasType<{
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ControlSignal"]: AliasType<{
	name?:boolean | `@${string}`,
	signal?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Represents a user-defined start time. */
["CustomStartTime"]: AliasType<{
	/** User-provided start time (ISO 8601). */
	startTime?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Delay for connections between nodes. */
["Delay"]: AliasType<{
	fromNode?:ResolverInputTypes["Node"],
	toNode?:ResolverInputTypes["Node"],
	delay?:boolean | `@${string}`,
	minDelayFlow?:boolean | `@${string}`,
	maxDelayFlow?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Duration"]: AliasType<{
	hours?:boolean | `@${string}`,
	minutes?:boolean | `@${string}`,
	seconds?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ElectricityPriceOutcome"]: AliasType<{
	time?:boolean | `@${string}`,
	price?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["FloatList"]: AliasType<{
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Forecast"]: AliasType<{
	name?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ForecastValue"]: AliasType<{
	scenario?:boolean | `@${string}`,
	value?:ResolverInputTypes["Forecastable"],
		__typename?: boolean | `@${string}`
}>;
	["GenConstraint"]: AliasType<{
	name?:boolean | `@${string}`,
	gcType?:boolean | `@${string}`,
	isSetpoint?:boolean | `@${string}`,
	penalty?:boolean | `@${string}`,
	factors?:ResolverInputTypes["ConFactor"],
	constant?:ResolverInputTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	["InflowBlock"]: AliasType<{
	name?:boolean | `@${string}`,
	node?:ResolverInputTypes["Node"],
	data?:ResolverInputTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	/** The model itself. */
["InputData"]: AliasType<{
	scenarios?:ResolverInputTypes["Scenario"],
	setup?:ResolverInputTypes["InputDataSetup"],
	processes?:ResolverInputTypes["Process"],
	nodes?:ResolverInputTypes["Node"],
	nodeDiffusion?:ResolverInputTypes["NodeDiffusion"],
	nodeDelay?:ResolverInputTypes["Delay"],
	nodeHistories?:ResolverInputTypes["NodeHistory"],
	markets?:ResolverInputTypes["Market"],
	nodeGroups?:ResolverInputTypes["NodeGroup"],
	processGroups?:ResolverInputTypes["ProcessGroup"],
	reserveType?:ResolverInputTypes["ReserveType"],
	risk?:ResolverInputTypes["Risk"],
	inflowBlocks?:ResolverInputTypes["InflowBlock"],
	genConstraints?:ResolverInputTypes["GenConstraint"],
		__typename?: boolean | `@${string}`
}>;
	["InputDataSetup"]: AliasType<{
	containsReserves?:boolean | `@${string}`,
	containOnline?:boolean | `@${string}`,
	containsStates?:boolean | `@${string}`,
	containsPiecewiseEff?:boolean | `@${string}`,
	containsRisk?:boolean | `@${string}`,
	containsDiffusion?:boolean | `@${string}`,
	containsDelay?:boolean | `@${string}`,
	containsMarkets?:boolean | `@${string}`,
	reserveRealisation?:boolean | `@${string}`,
	useMarketBids?:boolean | `@${string}`,
	commonTimeSteps?:boolean | `@${string}`,
	commonScenario?:ResolverInputTypes["Scenario"],
	useNodeDummyVariables?:boolean | `@${string}`,
	useRampDummyVariables?:boolean | `@${string}`,
	nodeDummyVariableCost?:boolean | `@${string}`,
	rampDummyVariableCost?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["JobStatus"]: AliasType<{
	state?:boolean | `@${string}`,
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["LocationSettings"]: AliasType<{
	/** Country. */
	country?:boolean | `@${string}`,
	/** Place within country. */
	place?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Market"]: AliasType<{
	name?:boolean | `@${string}`,
	mType?:boolean | `@${string}`,
	node?:ResolverInputTypes["Node"],
	processGroup?:ResolverInputTypes["ProcessGroup"],
	direction?:boolean | `@${string}`,
	realisation?:boolean | `@${string}`,
	reserveType?:ResolverInputTypes["ReserveType"],
	isBid?:boolean | `@${string}`,
	isLimited?:boolean | `@${string}`,
	minBid?:boolean | `@${string}`,
	maxBid?:boolean | `@${string}`,
	fee?:boolean | `@${string}`,
	price?:ResolverInputTypes["ForecastValue"],
	upPrice?:ResolverInputTypes["ForecastValue"],
	downPrice?:ResolverInputTypes["ForecastValue"],
	reserveActivationPrice?:ResolverInputTypes["Value"],
	fixed?:ResolverInputTypes["MarketFix"],
		__typename?: boolean | `@${string}`
}>;
	["MarketFix"]: AliasType<{
	name?:boolean | `@${string}`,
	factor?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["MaybeError"]: AliasType<{
	/** Error message; if null, the operation succeeded. */
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Optimization model. */
["Model"]: AliasType<{
	timeLine?:ResolverInputTypes["TimeLineSettings"],
	inputData?:ResolverInputTypes["InputData"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	/** Start optimization job. Return job ID. */
	startOptimization?:boolean | `@${string}`,
	/** Start electricity price fetch job. Return job ID. */
	startElectricityPriceFetch?:boolean | `@${string}`,
	/** Start weather forecast job. Return job ID. */
	startWeatherForecastFetch?:boolean | `@${string}`,
updateTimeLine?: [{	timeLineInput: ResolverInputTypes["TimeLineUpdate"]},ResolverInputTypes["ValidationErrors"]],
createScenario?: [{	name: string,	weight: number},ResolverInputTypes["MaybeError"]],
deleteScenario?: [{	name: string},ResolverInputTypes["MaybeError"]],
	/** Save the model on disk. */
	saveModel?:ResolverInputTypes["MaybeError"],
	/** Clear input data from model. */
	clearInputData?:ResolverInputTypes["MaybeError"],
updateInputDataSetup?: [{	setupUpdate: ResolverInputTypes["InputDataSetupUpdate"]},ResolverInputTypes["ValidationErrors"]],
createNodeGroup?: [{	name: string},ResolverInputTypes["MaybeError"]],
createProcessGroup?: [{	name: string},ResolverInputTypes["MaybeError"]],
deleteGroup?: [{	name: string},ResolverInputTypes["MaybeError"]],
createProcess?: [{	process: ResolverInputTypes["NewProcess"]},ResolverInputTypes["ValidationErrors"]],
addProcessToGroup?: [{	processName: string,	groupName: string},ResolverInputTypes["MaybeError"]],
deleteProcess?: [{	name: string},ResolverInputTypes["MaybeError"]],
createTopology?: [{	topology: ResolverInputTypes["NewTopology"],	sourceNodeName?: string | undefined | null,	processName: string,	sinkNodeName?: string | undefined | null},ResolverInputTypes["ValidationErrors"]],
deleteTopology?: [{	sourceNodeName?: string | undefined | null,	processName: string,	sinkNodeName?: string | undefined | null},ResolverInputTypes["MaybeError"]],
createNode?: [{	node: ResolverInputTypes["NewNode"]},ResolverInputTypes["ValidationErrors"]],
addNodeToGroup?: [{	nodeName: string,	groupName: string},ResolverInputTypes["MaybeError"]],
setNodeState?: [{	state?: ResolverInputTypes["StateInput"] | undefined | null,	nodeName: string},ResolverInputTypes["ValidationErrors"]],
updateNodeState?: [{	state: ResolverInputTypes["StateUpdate"],	nodeName: string},ResolverInputTypes["ValidationErrors"]],
connectNodeInflowToTemperatureForecast?: [{	nodeName: string,	forecastName: string},ResolverInputTypes["MaybeError"]],
deleteNode?: [{	name: string},ResolverInputTypes["MaybeError"]],
createNodeDiffusion?: [{	newDiffusion: ResolverInputTypes["NewNodeDiffusion"]},ResolverInputTypes["ValidationErrors"]],
deleteNodeDiffusion?: [{	fromNode: string,	toNode: string},ResolverInputTypes["MaybeError"]],
createNodeDelay?: [{	delay: ResolverInputTypes["NewNodeDelay"]},ResolverInputTypes["ValidationErrors"]],
deleteNodeDelay?: [{	fromNode: string,	toNode: string},ResolverInputTypes["MaybeError"]],
createNodeHistory?: [{	nodeName: string},ResolverInputTypes["ValidationErrors"]],
deleteNodeHistory?: [{	nodeName: string},ResolverInputTypes["MaybeError"]],
addStepToNodeHistory?: [{	nodeName: string,	step: ResolverInputTypes["NewSeries"]},ResolverInputTypes["ValidationErrors"]],
clearNodeHistorySteps?: [{	nodeName: string},ResolverInputTypes["MaybeError"]],
createMarket?: [{	market: ResolverInputTypes["NewMarket"]},ResolverInputTypes["ValidationErrors"]],
connectMarketPricesToForecast?: [{	marketName: string,	forecastName: string},ResolverInputTypes["MaybeError"]],
deleteMarket?: [{	name: string},ResolverInputTypes["MaybeError"]],
createRisk?: [{	risk: ResolverInputTypes["NewRisk"]},ResolverInputTypes["ValidationErrors"]],
deleteRisk?: [{	parameter: string},ResolverInputTypes["MaybeError"]],
createGenConstraint?: [{	constraint: ResolverInputTypes["NewGenConstraint"]},ResolverInputTypes["ValidationErrors"]],
deleteGenConstraint?: [{	name: string},ResolverInputTypes["MaybeError"]],
createFlowConFactor?: [{	factor: Array<ResolverInputTypes["ValueInput"]>,	constraintName: string,	processName: string,	sourceOrSinkNodeName: string},ResolverInputTypes["ValidationErrors"]],
deleteFlowConFactor?: [{	constraintName: string,	processName: string,	sourceOrSinkNodeName: string},ResolverInputTypes["MaybeError"]],
createStateConFactor?: [{	factor: Array<ResolverInputTypes["ValueInput"]>,	constraintName: string,	nodeName: string},ResolverInputTypes["ValidationErrors"]],
deleteStateConFactor?: [{	constraintName: string,	nodeName: string},ResolverInputTypes["MaybeError"]],
createOnlineConFactor?: [{	factor: Array<ResolverInputTypes["ValueInput"]>,	constraintName: string,	processName: string},ResolverInputTypes["ValidationErrors"]],
deleteOnlineConFactor?: [{	constraintName: string,	processName: string},ResolverInputTypes["MaybeError"]],
updateSettings?: [{	settingsInput: ResolverInputTypes["SettingsInput"]},ResolverInputTypes["SettingsResult"]],
		__typename?: boolean | `@${string}`
}>;
	["Node"]: AliasType<{
	name?:boolean | `@${string}`,
	groups?:ResolverInputTypes["NodeGroup"],
	isCommodity?:boolean | `@${string}`,
	isMarket?:boolean | `@${string}`,
	isRes?:boolean | `@${string}`,
	state?:ResolverInputTypes["State"],
	cost?:ResolverInputTypes["Value"],
	inflow?:ResolverInputTypes["Forecastable"],
		__typename?: boolean | `@${string}`
}>;
	["NodeDiffusion"]: AliasType<{
	fromNode?:ResolverInputTypes["Node"],
	toNode?:ResolverInputTypes["Node"],
	coefficient?:ResolverInputTypes["Value"],
		__typename?: boolean | `@${string}`
}>;
	["NodeGroup"]: AliasType<{
	name?:boolean | `@${string}`,
	members?:ResolverInputTypes["Node"],
		__typename?: boolean | `@${string}`
}>;
	["NodeHistory"]: AliasType<{
	node?:ResolverInputTypes["Node"],
	steps?:ResolverInputTypes["Series"],
		__typename?: boolean | `@${string}`
}>;
	["OptimizationOutcome"]: AliasType<{
	time?:boolean | `@${string}`,
	controlSignals?:ResolverInputTypes["ControlSignal"],
		__typename?: boolean | `@${string}`
}>;
	["Point"]: AliasType<{
	x?:boolean | `@${string}`,
	y?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Process"]: AliasType<{
	name?:boolean | `@${string}`,
	groups?:ResolverInputTypes["ProcessGroup"],
	conversion?:boolean | `@${string}`,
	isCf?:boolean | `@${string}`,
	isCfFix?:boolean | `@${string}`,
	isOnline?:boolean | `@${string}`,
	isRes?:boolean | `@${string}`,
	eff?:boolean | `@${string}`,
	loadMin?:boolean | `@${string}`,
	loadMax?:boolean | `@${string}`,
	startCost?:boolean | `@${string}`,
	minOnline?:boolean | `@${string}`,
	minOffline?:boolean | `@${string}`,
	maxOnline?:boolean | `@${string}`,
	maxOffline?:boolean | `@${string}`,
	isScenarioIndependent?:boolean | `@${string}`,
	topos?:ResolverInputTypes["Topology"],
	cf?:ResolverInputTypes["Value"],
	effTs?:ResolverInputTypes["Value"],
	effOps?:boolean | `@${string}`,
	effFun?:ResolverInputTypes["Point"],
		__typename?: boolean | `@${string}`
}>;
	["ProcessGroup"]: AliasType<{
	name?:boolean | `@${string}`,
	members?:ResolverInputTypes["Process"],
		__typename?: boolean | `@${string}`
}>;
	["Query"]: AliasType<{
	settings?:ResolverInputTypes["Settings"],
	model?:ResolverInputTypes["Model"],
genConstraint?: [{	name: string},ResolverInputTypes["GenConstraint"]],
nodeGroup?: [{	name: string},ResolverInputTypes["NodeGroup"]],
nodesInGroup?: [{	name: string},ResolverInputTypes["Node"]],
processGroup?: [{	name: string},ResolverInputTypes["ProcessGroup"]],
processesInGroup?: [{	name: string},ResolverInputTypes["Process"]],
market?: [{	name: string},ResolverInputTypes["Market"]],
node?: [{	name: string},ResolverInputTypes["Node"]],
groupsForNode?: [{	name: string},ResolverInputTypes["NodeGroup"]],
nodeDiffusion?: [{	fromNode: string,	toNode: string},ResolverInputTypes["NodeDiffusion"]],
groupsForProcess?: [{	name: string},ResolverInputTypes["ProcessGroup"]],
process?: [{	name: string},ResolverInputTypes["Process"]],
conFactorsForProcess?: [{	name: string},ResolverInputTypes["ConFactor"]],
scenario?: [{	name: string},ResolverInputTypes["Scenario"]],
jobStatus?: [{	jobId: number},ResolverInputTypes["JobStatus"]],
jobOutcome?: [{	jobId: number},ResolverInputTypes["JobOutcome"]],
		__typename?: boolean | `@${string}`
}>;
	["ReserveType"]: AliasType<{
	name?:boolean | `@${string}`,
	rampRate?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Risk"]: AliasType<{
	parameter?:boolean | `@${string}`,
	value?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Scenario for stochastics. */
["Scenario"]: AliasType<{
	/** Scenario name. */
	name?:boolean | `@${string}`,
	/** Scenario weight. */
	weight?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Series"]: AliasType<{
	scenario?:boolean | `@${string}`,
	durations?:ResolverInputTypes["Duration"],
	values?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** General Hertta settings. */
["Settings"]: AliasType<{
	/** Device location. */
	location?:ResolverInputTypes["LocationSettings"],
		__typename?: boolean | `@${string}`
}>;
	["State"]: AliasType<{
	inMax?:boolean | `@${string}`,
	outMax?:boolean | `@${string}`,
	stateLossProportional?:boolean | `@${string}`,
	stateMax?:boolean | `@${string}`,
	stateMin?:boolean | `@${string}`,
	initialState?:boolean | `@${string}`,
	isScenarioIndependent?:boolean | `@${string}`,
	isTemp?:boolean | `@${string}`,
	tEConversion?:boolean | `@${string}`,
	residualValue?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	/** Optimization time line settings. */
["TimeLineSettings"]: AliasType<{
	/** Time line duration. */
	duration?:ResolverInputTypes["Duration"],
	/** Time step length. */
	step?:ResolverInputTypes["Duration"],
	/** Start of the time line. */
	start?:ResolverInputTypes["TimeLineStart"],
		__typename?: boolean | `@${string}`
}>;
	["Topology"]: AliasType<{
	source?:ResolverInputTypes["NodeOrProcess"],
	sink?:ResolverInputTypes["NodeOrProcess"],
		__typename?: boolean | `@${string}`
}>;
	["ValidationError"]: AliasType<{
	field?:boolean | `@${string}`,
	message?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["ValidationErrors"]: AliasType<{
	errors?:ResolverInputTypes["ValidationError"],
		__typename?: boolean | `@${string}`
}>;
	["Value"]: AliasType<{
	scenario?:boolean | `@${string}`,
	value?:ResolverInputTypes["SeriesValue"],
		__typename?: boolean | `@${string}`
}>;
	["VariableId"]: AliasType<{
	entity?:ResolverInputTypes["NodeOrProcess"],
	identifier?:ResolverInputTypes["Node"],
		__typename?: boolean | `@${string}`
}>;
	["WeatherForecastOutcome"]: AliasType<{
	time?:boolean | `@${string}`,
	temperature?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Forecastable"]: AliasType<{
	Constant?:ResolverInputTypes["Constant"],
	FloatList?:ResolverInputTypes["FloatList"],
	Forecast?:ResolverInputTypes["Forecast"],
		__typename?: boolean | `@${string}`
}>;
	["JobOutcome"]: AliasType<{
	ElectricityPriceOutcome?:ResolverInputTypes["ElectricityPriceOutcome"],
	OptimizationOutcome?:ResolverInputTypes["OptimizationOutcome"],
	WeatherForecastOutcome?:ResolverInputTypes["WeatherForecastOutcome"],
		__typename?: boolean | `@${string}`
}>;
	["NodeOrProcess"]: AliasType<{
	Node?:ResolverInputTypes["Node"],
	Process?:ResolverInputTypes["Process"],
		__typename?: boolean | `@${string}`
}>;
	["SeriesValue"]: AliasType<{
	Constant?:ResolverInputTypes["Constant"],
	FloatList?:ResolverInputTypes["FloatList"],
		__typename?: boolean | `@${string}`
}>;
	["SettingsResult"]: AliasType<{
	Settings?:ResolverInputTypes["Settings"],
	ValidationErrors?:ResolverInputTypes["ValidationErrors"],
		__typename?: boolean | `@${string}`
}>;
	/** Defines the start of the time line. */
["TimeLineStart"]: AliasType<{
	ClockChoice?:ResolverInputTypes["ClockChoice"],
	CustomStartTime?:ResolverInputTypes["CustomStartTime"],
		__typename?: boolean | `@${string}`
}>
  }

export type ModelTypes = {
    ["schema"]: {
	query?: ModelTypes["Query"] | undefined | null,
	mutation?: ModelTypes["Mutation"] | undefined | null
};
	["Clock"]:Clock;
	["ConstraintFactorType"]:ConstraintFactorType;
	["ConstraintType"]:ConstraintType;
	["Conversion"]:Conversion;
	["JobState"]:JobState;
	["MarketDirection"]:MarketDirection;
	["MarketType"]:MarketType;
	["DurationInput"]: {
	hours: number,
	minutes: number,
	seconds: number
};
	["ForecastValueInput"]: {
	scenario?: string | undefined | null,
	constant?: number | undefined | null,
	series?: Array<number> | undefined | null,
	forecast?: string | undefined | null
};
	["InputDataSetupUpdate"]: {
	containsReserves?: boolean | undefined | null,
	containsOnline?: boolean | undefined | null,
	containsStates?: boolean | undefined | null,
	containsPiecewiseEff?: boolean | undefined | null,
	containsRisk?: boolean | undefined | null,
	containsDiffusion?: boolean | undefined | null,
	containsDelay?: boolean | undefined | null,
	containsMarkets?: boolean | undefined | null,
	reserveRealization?: boolean | undefined | null,
	useMarketBids?: boolean | undefined | null,
	commonTimesteps?: number | undefined | null,
	commonScenarioName?: string | undefined | null,
	useNodeDummyVariables?: boolean | undefined | null,
	useRampDummyVariables?: boolean | undefined | null,
	nodeDummyVariableCost?: number | undefined | null,
	rampDummyVariableCost?: number | undefined | null
};
	/** Location input. */
["LocationInput"]: {
	/** Country. */
	country?: string | undefined | null,
	/** Place within the country. */
	place?: string | undefined | null
};
	["NewGenConstraint"]: {
	name: string,
	gcType: ModelTypes["ConstraintType"],
	isSetpoint: boolean,
	penalty: number,
	constant: Array<ModelTypes["ValueInput"]>
};
	["NewMarket"]: {
	name: string,
	mType: ModelTypes["MarketType"],
	node: string,
	processGroup: string,
	direction?: ModelTypes["MarketDirection"] | undefined | null,
	realisation?: number | undefined | null,
	reserveType?: string | undefined | null,
	isBid: boolean,
	isLimited: boolean,
	minBid: number,
	maxBid: number,
	fee: number,
	price: Array<ModelTypes["ForecastValueInput"]>,
	upPrice: Array<ModelTypes["ForecastValueInput"]>,
	downPrice: Array<ModelTypes["ForecastValueInput"]>,
	reserveActivationPrice: Array<ModelTypes["ValueInput"]>
};
	["NewNode"]: {
	name: string,
	isCommodity: boolean,
	isMarket: boolean,
	isRes: boolean,
	cost: Array<ModelTypes["ValueInput"]>,
	inflow?: number | undefined | null
};
	["NewNodeDelay"]: {
	fromNode: string,
	toNode: string,
	delay: number,
	minDelayFlow: number,
	maxDelayFlow: number
};
	["NewNodeDiffusion"]: {
	fromNode: string,
	toNode: string,
	coefficient: Array<ModelTypes["ValueInput"]>
};
	["NewProcess"]: {
	name: string,
	conversion: ModelTypes["Conversion"],
	isCfFix: boolean,
	isOnline: boolean,
	isRes: boolean,
	eff: number,
	loadMin: number,
	loadMax: number,
	startCost: number,
	minOnline: number,
	maxOnline: number,
	minOffline: number,
	maxOffline: number,
	initialState: boolean,
	isScenarioIndependent: boolean,
	cf: Array<ModelTypes["ValueInput"]>,
	effTs: Array<ModelTypes["ValueInput"]>
};
	["NewRisk"]: {
	parameter: string,
	value: number
};
	["NewSeries"]: {
	scenario: string,
	durations: Array<ModelTypes["DurationInput"]>,
	values: Array<number>
};
	["NewTopology"]: {
	capacity: number,
	vomCost: number,
	rampUp: number,
	rampDown: number,
	initialLoad: number,
	initialFlow: number,
	capTs: Array<ModelTypes["ValueInput"]>
};
	["SettingsInput"]: {
	location?: ModelTypes["LocationInput"] | undefined | null
};
	["StateInput"]: {
	inMax: number,
	outMax: number,
	stateLossProportional: number,
	stateMin: number,
	stateMax: number,
	initialState: number,
	isScenarioIndependent: boolean,
	isTemp: boolean,
	tEConversion: number,
	residualValue: number
};
	["StateUpdate"]: {
	inMax?: number | undefined | null,
	outMax?: number | undefined | null,
	stateLossProportional?: number | undefined | null,
	stateMax?: number | undefined | null,
	stateMin?: number | undefined | null,
	initialState?: number | undefined | null,
	isScenarioIndependent?: boolean | undefined | null,
	isTemp?: boolean | undefined | null,
	tEConversion?: number | undefined | null,
	residualValue?: number | undefined | null
};
	["TimeLineUpdate"]: {
	duration?: ModelTypes["DurationInput"] | undefined | null,
	step?: ModelTypes["DurationInput"] | undefined | null
};
	["ValueInput"]: {
	scenario?: string | undefined | null,
	constant?: number | undefined | null,
	series?: Array<number> | undefined | null
};
	/** Combined date and time (with time zone) in [RFC 3339][0] format.

Represents a description of an exact instant on the time-line (such as the
instant that a user account was created).

[`DateTime` scalar][1] compliant.

See also [`chrono::DateTime`][2] for details.

[0]: https://datatracker.ietf.org/doc/html/rfc3339#section-5
[1]: https://graphql-scalars.dev/docs/scalars/date-time
[2]: https://docs.rs/chrono/latest/chrono/struct.DateTime.html */
["DateTime"]:any;
	/** Defines a clock-based start time. */
["ClockChoice"]: {
		/** Predefined clock option. */
	choice: ModelTypes["Clock"]
};
	["ConFactor"]: {
		varType: ModelTypes["ConstraintFactorType"],
	varTuple: ModelTypes["VariableId"],
	data: Array<ModelTypes["Value"]>
};
	["Constant"]: {
		value: number
};
	["ControlSignal"]: {
		name: string,
	signal: Array<number>
};
	/** Represents a user-defined start time. */
["CustomStartTime"]: {
		/** User-provided start time (ISO 8601). */
	startTime: ModelTypes["DateTime"]
};
	/** Delay for connections between nodes. */
["Delay"]: {
		fromNode: ModelTypes["Node"],
	toNode: ModelTypes["Node"],
	delay: number,
	minDelayFlow: number,
	maxDelayFlow: number
};
	["Duration"]: {
		hours: number,
	minutes: number,
	seconds: number
};
	["ElectricityPriceOutcome"]: {
		time: Array<ModelTypes["DateTime"]>,
	price: Array<number>
};
	["FloatList"]: {
		values: Array<number>
};
	["Forecast"]: {
		name: string
};
	["ForecastValue"]: {
		scenario?: string | undefined | null,
	value: ModelTypes["Forecastable"]
};
	["GenConstraint"]: {
		name: string,
	gcType: ModelTypes["ConstraintType"],
	isSetpoint: boolean,
	penalty: number,
	factors: Array<ModelTypes["ConFactor"]>,
	constant: Array<ModelTypes["Value"]>
};
	["InflowBlock"]: {
		name: string,
	node: ModelTypes["Node"],
	data: Array<ModelTypes["Value"]>
};
	/** The model itself. */
["InputData"]: {
		scenarios: Array<ModelTypes["Scenario"]>,
	setup: ModelTypes["InputDataSetup"],
	processes: Array<ModelTypes["Process"]>,
	nodes: Array<ModelTypes["Node"]>,
	nodeDiffusion: Array<ModelTypes["NodeDiffusion"]>,
	nodeDelay: Array<ModelTypes["Delay"]>,
	nodeHistories: Array<ModelTypes["NodeHistory"]>,
	markets: Array<ModelTypes["Market"]>,
	nodeGroups: Array<ModelTypes["NodeGroup"]>,
	processGroups: Array<ModelTypes["ProcessGroup"]>,
	reserveType: Array<ModelTypes["ReserveType"]>,
	risk: Array<ModelTypes["Risk"]>,
	inflowBlocks: Array<ModelTypes["InflowBlock"]>,
	genConstraints: Array<ModelTypes["GenConstraint"]>
};
	["InputDataSetup"]: {
		containsReserves: boolean,
	containOnline: boolean,
	containsStates: boolean,
	containsPiecewiseEff: boolean,
	containsRisk: boolean,
	containsDiffusion: boolean,
	containsDelay: boolean,
	containsMarkets: boolean,
	reserveRealisation: boolean,
	useMarketBids: boolean,
	commonTimeSteps: number,
	commonScenario: ModelTypes["Scenario"],
	useNodeDummyVariables: boolean,
	useRampDummyVariables: boolean,
	nodeDummyVariableCost: number,
	rampDummyVariableCost: number
};
	["JobStatus"]: {
		state: ModelTypes["JobState"],
	message?: string | undefined | null
};
	["LocationSettings"]: {
		/** Country. */
	country: string,
	/** Place within country. */
	place: string
};
	["Market"]: {
		name: string,
	mType: ModelTypes["MarketType"],
	node: ModelTypes["Node"],
	processGroup: ModelTypes["ProcessGroup"],
	direction?: ModelTypes["MarketDirection"] | undefined | null,
	realisation?: number | undefined | null,
	reserveType?: ModelTypes["ReserveType"] | undefined | null,
	isBid: boolean,
	isLimited: boolean,
	minBid: number,
	maxBid: number,
	fee: number,
	price: Array<ModelTypes["ForecastValue"]>,
	upPrice: Array<ModelTypes["ForecastValue"]>,
	downPrice: Array<ModelTypes["ForecastValue"]>,
	reserveActivationPrice: Array<ModelTypes["Value"]>,
	fixed: Array<ModelTypes["MarketFix"]>
};
	["MarketFix"]: {
		name: string,
	factor: number
};
	["MaybeError"]: {
		/** Error message; if null, the operation succeeded. */
	message?: string | undefined | null
};
	/** Optimization model. */
["Model"]: {
		timeLine: ModelTypes["TimeLineSettings"],
	inputData: ModelTypes["InputData"]
};
	["Mutation"]: {
		/** Start optimization job. Return job ID. */
	startOptimization: number,
	/** Start electricity price fetch job. Return job ID. */
	startElectricityPriceFetch: number,
	/** Start weather forecast job. Return job ID. */
	startWeatherForecastFetch: number,
	/** Update model's time line. */
	updateTimeLine: ModelTypes["ValidationErrors"],
	/** Create new scenario. */
	createScenario: ModelTypes["MaybeError"],
	/** Delete a scenario and all items that depend on that scenario. */
	deleteScenario: ModelTypes["MaybeError"],
	/** Save the model on disk. */
	saveModel: ModelTypes["MaybeError"],
	/** Clear input data from model. */
	clearInputData: ModelTypes["MaybeError"],
	/** Update input data setup. */
	updateInputDataSetup: ModelTypes["ValidationErrors"],
	/** Create new node group */
	createNodeGroup: ModelTypes["MaybeError"],
	/** Create new process group. */
	createProcessGroup: ModelTypes["MaybeError"],
	deleteGroup: ModelTypes["MaybeError"],
	/** Create new process. */
	createProcess: ModelTypes["ValidationErrors"],
	/** Add process to process group. */
	addProcessToGroup: ModelTypes["MaybeError"],
	/** Delete a process and all items that depend on that process. */
	deleteProcess: ModelTypes["MaybeError"],
	/** Create new topology and add it to process. */
	createTopology: ModelTypes["ValidationErrors"],
	deleteTopology: ModelTypes["MaybeError"],
	/** Create new node. */
	createNode: ModelTypes["ValidationErrors"],
	/** Add node to node group. */
	addNodeToGroup: ModelTypes["MaybeError"],
	/** Set state for node. Null clears the state. */
	setNodeState: ModelTypes["ValidationErrors"],
	/** Update state of a node. The state has to be set. */
	updateNodeState: ModelTypes["ValidationErrors"],
	connectNodeInflowToTemperatureForecast: ModelTypes["MaybeError"],
	/** Delete a node and all items that depend on that node. */
	deleteNode: ModelTypes["MaybeError"],
	/** Create new diffusion between nodes. */
	createNodeDiffusion: ModelTypes["ValidationErrors"],
	deleteNodeDiffusion: ModelTypes["MaybeError"],
	createNodeDelay: ModelTypes["ValidationErrors"],
	deleteNodeDelay: ModelTypes["MaybeError"],
	createNodeHistory: ModelTypes["ValidationErrors"],
	deleteNodeHistory: ModelTypes["MaybeError"],
	addStepToNodeHistory: ModelTypes["ValidationErrors"],
	clearNodeHistorySteps: ModelTypes["MaybeError"],
	/** Create new market. */
	createMarket: ModelTypes["ValidationErrors"],
	/** Connects market's normal, up and down prices to electricity price forecast. */
	connectMarketPricesToForecast: ModelTypes["MaybeError"],
	deleteMarket: ModelTypes["MaybeError"],
	/** Create new risk. */
	createRisk: ModelTypes["ValidationErrors"],
	deleteRisk: ModelTypes["MaybeError"],
	/** Create new generic constraint. */
	createGenConstraint: ModelTypes["ValidationErrors"],
	deleteGenConstraint: ModelTypes["MaybeError"],
	/** Create new flow constraint factor and add it to generic constraint. */
	createFlowConFactor: ModelTypes["ValidationErrors"],
	deleteFlowConFactor: ModelTypes["MaybeError"],
	/** Create new state constraint factor and add it to generic constraint. */
	createStateConFactor: ModelTypes["ValidationErrors"],
	deleteStateConFactor: ModelTypes["MaybeError"],
	/** Create new online constraint factor and add it to generic constraint. */
	createOnlineConFactor: ModelTypes["ValidationErrors"],
	deleteOnlineConFactor: ModelTypes["MaybeError"],
	updateSettings: ModelTypes["SettingsResult"]
};
	["Node"]: {
		name: string,
	groups: Array<ModelTypes["NodeGroup"]>,
	isCommodity: boolean,
	isMarket: boolean,
	isRes: boolean,
	state?: ModelTypes["State"] | undefined | null,
	cost: Array<ModelTypes["Value"]>,
	inflow?: ModelTypes["Forecastable"] | undefined | null
};
	["NodeDiffusion"]: {
		fromNode: ModelTypes["Node"],
	toNode: ModelTypes["Node"],
	coefficient: Array<ModelTypes["Value"]>
};
	["NodeGroup"]: {
		name: string,
	members: Array<ModelTypes["Node"]>
};
	["NodeHistory"]: {
		node: ModelTypes["Node"],
	steps: Array<ModelTypes["Series"]>
};
	["OptimizationOutcome"]: {
		time: Array<ModelTypes["DateTime"]>,
	controlSignals: Array<ModelTypes["ControlSignal"]>
};
	["Point"]: {
		x: number,
	y: number
};
	["Process"]: {
		name: string,
	groups: Array<ModelTypes["ProcessGroup"]>,
	conversion: ModelTypes["Conversion"],
	isCf: boolean,
	isCfFix: boolean,
	isOnline: boolean,
	isRes: boolean,
	eff: number,
	loadMin: number,
	loadMax: number,
	startCost: number,
	minOnline: number,
	minOffline: number,
	maxOnline: number,
	maxOffline: number,
	isScenarioIndependent: boolean,
	topos: Array<ModelTypes["Topology"]>,
	cf: Array<ModelTypes["Value"]>,
	effTs: Array<ModelTypes["Value"]>,
	effOps: Array<string>,
	effFun: Array<ModelTypes["Point"]>
};
	["ProcessGroup"]: {
		name: string,
	members: Array<ModelTypes["Process"]>
};
	["Query"]: {
		settings: ModelTypes["Settings"],
	model: ModelTypes["Model"],
	genConstraint: ModelTypes["GenConstraint"],
	nodeGroup: ModelTypes["NodeGroup"],
	nodesInGroup: Array<ModelTypes["Node"]>,
	processGroup: ModelTypes["ProcessGroup"],
	processesInGroup: Array<ModelTypes["Process"]>,
	market: ModelTypes["Market"],
	node: ModelTypes["Node"],
	/** Return all groups the given node is member of. */
	groupsForNode: Array<ModelTypes["NodeGroup"]>,
	nodeDiffusion: ModelTypes["NodeDiffusion"],
	/** Return all groups the given process is member of. */
	groupsForProcess: Array<ModelTypes["ProcessGroup"]>,
	process: ModelTypes["Process"],
	conFactorsForProcess: Array<ModelTypes["ConFactor"]>,
	scenario: ModelTypes["Scenario"],
	jobStatus: ModelTypes["JobStatus"],
	jobOutcome: ModelTypes["JobOutcome"]
};
	["ReserveType"]: {
		name: string,
	rampRate: number
};
	["Risk"]: {
		parameter: string,
	value: number
};
	/** Scenario for stochastics. */
["Scenario"]: {
		/** Scenario name. */
	name: string,
	/** Scenario weight. */
	weight: number
};
	["Series"]: {
		scenario: string,
	durations: Array<ModelTypes["Duration"]>,
	values: Array<number>
};
	/** General Hertta settings. */
["Settings"]: {
		/** Device location. */
	location?: ModelTypes["LocationSettings"] | undefined | null
};
	["State"]: {
		inMax: number,
	outMax: number,
	stateLossProportional: number,
	stateMax: number,
	stateMin: number,
	initialState: number,
	isScenarioIndependent: boolean,
	isTemp: boolean,
	tEConversion: number,
	residualValue: number
};
	/** Optimization time line settings. */
["TimeLineSettings"]: {
		/** Time line duration. */
	duration: ModelTypes["Duration"],
	/** Time step length. */
	step: ModelTypes["Duration"],
	/** Start of the time line. */
	start: ModelTypes["TimeLineStart"]
};
	["Topology"]: {
		source: ModelTypes["NodeOrProcess"],
	sink: ModelTypes["NodeOrProcess"]
};
	["ValidationError"]: {
		field: string,
	message: string
};
	["ValidationErrors"]: {
		errors: Array<ModelTypes["ValidationError"]>
};
	["Value"]: {
		scenario?: string | undefined | null,
	value: ModelTypes["SeriesValue"]
};
	["VariableId"]: {
		entity: ModelTypes["NodeOrProcess"],
	identifier?: ModelTypes["Node"] | undefined | null
};
	["WeatherForecastOutcome"]: {
		time: Array<ModelTypes["DateTime"]>,
	temperature: Array<number>
};
	["Forecastable"]:ModelTypes["Constant"] | ModelTypes["FloatList"] | ModelTypes["Forecast"];
	["JobOutcome"]:ModelTypes["ElectricityPriceOutcome"] | ModelTypes["OptimizationOutcome"] | ModelTypes["WeatherForecastOutcome"];
	["NodeOrProcess"]:ModelTypes["Node"] | ModelTypes["Process"];
	["SeriesValue"]:ModelTypes["Constant"] | ModelTypes["FloatList"];
	["SettingsResult"]:ModelTypes["Settings"] | ModelTypes["ValidationErrors"];
	/** Defines the start of the time line. */
["TimeLineStart"]:ModelTypes["ClockChoice"] | ModelTypes["CustomStartTime"]
    }

export type GraphQLTypes = {
    /** Represents predefined clock options. */
["Clock"]: Clock;
	["ConstraintFactorType"]: ConstraintFactorType;
	["ConstraintType"]: ConstraintType;
	["Conversion"]: Conversion;
	["JobState"]: JobState;
	["MarketDirection"]: MarketDirection;
	["MarketType"]: MarketType;
	["DurationInput"]: {
		hours: number,
	minutes: number,
	seconds: number
};
	["ForecastValueInput"]: {
		scenario?: string | undefined | null,
	constant?: number | undefined | null,
	series?: Array<number> | undefined | null,
	forecast?: string | undefined | null
};
	["InputDataSetupUpdate"]: {
		containsReserves?: boolean | undefined | null,
	containsOnline?: boolean | undefined | null,
	containsStates?: boolean | undefined | null,
	containsPiecewiseEff?: boolean | undefined | null,
	containsRisk?: boolean | undefined | null,
	containsDiffusion?: boolean | undefined | null,
	containsDelay?: boolean | undefined | null,
	containsMarkets?: boolean | undefined | null,
	reserveRealization?: boolean | undefined | null,
	useMarketBids?: boolean | undefined | null,
	commonTimesteps?: number | undefined | null,
	commonScenarioName?: string | undefined | null,
	useNodeDummyVariables?: boolean | undefined | null,
	useRampDummyVariables?: boolean | undefined | null,
	nodeDummyVariableCost?: number | undefined | null,
	rampDummyVariableCost?: number | undefined | null
};
	/** Location input. */
["LocationInput"]: {
		/** Country. */
	country?: string | undefined | null,
	/** Place within the country. */
	place?: string | undefined | null
};
	["NewGenConstraint"]: {
		name: string,
	gcType: GraphQLTypes["ConstraintType"],
	isSetpoint: boolean,
	penalty: number,
	constant: Array<GraphQLTypes["ValueInput"]>
};
	["NewMarket"]: {
		name: string,
	mType: GraphQLTypes["MarketType"],
	node: string,
	processGroup: string,
	direction?: GraphQLTypes["MarketDirection"] | undefined | null,
	realisation?: number | undefined | null,
	reserveType?: string | undefined | null,
	isBid: boolean,
	isLimited: boolean,
	minBid: number,
	maxBid: number,
	fee: number,
	price: Array<GraphQLTypes["ForecastValueInput"]>,
	upPrice: Array<GraphQLTypes["ForecastValueInput"]>,
	downPrice: Array<GraphQLTypes["ForecastValueInput"]>,
	reserveActivationPrice: Array<GraphQLTypes["ValueInput"]>
};
	["NewNode"]: {
		name: string,
	isCommodity: boolean,
	isMarket: boolean,
	isRes: boolean,
	cost: Array<GraphQLTypes["ValueInput"]>,
	inflow?: number | undefined | null
};
	["NewNodeDelay"]: {
		fromNode: string,
	toNode: string,
	delay: number,
	minDelayFlow: number,
	maxDelayFlow: number
};
	["NewNodeDiffusion"]: {
		fromNode: string,
	toNode: string,
	coefficient: Array<GraphQLTypes["ValueInput"]>
};
	["NewProcess"]: {
		name: string,
	conversion: GraphQLTypes["Conversion"],
	isCfFix: boolean,
	isOnline: boolean,
	isRes: boolean,
	eff: number,
	loadMin: number,
	loadMax: number,
	startCost: number,
	minOnline: number,
	maxOnline: number,
	minOffline: number,
	maxOffline: number,
	initialState: boolean,
	isScenarioIndependent: boolean,
	cf: Array<GraphQLTypes["ValueInput"]>,
	effTs: Array<GraphQLTypes["ValueInput"]>
};
	["NewRisk"]: {
		parameter: string,
	value: number
};
	["NewSeries"]: {
		scenario: string,
	durations: Array<GraphQLTypes["DurationInput"]>,
	values: Array<number>
};
	["NewTopology"]: {
		capacity: number,
	vomCost: number,
	rampUp: number,
	rampDown: number,
	initialLoad: number,
	initialFlow: number,
	capTs: Array<GraphQLTypes["ValueInput"]>
};
	["SettingsInput"]: {
		location?: GraphQLTypes["LocationInput"] | undefined | null
};
	["StateInput"]: {
		inMax: number,
	outMax: number,
	stateLossProportional: number,
	stateMin: number,
	stateMax: number,
	initialState: number,
	isScenarioIndependent: boolean,
	isTemp: boolean,
	tEConversion: number,
	residualValue: number
};
	["StateUpdate"]: {
		inMax?: number | undefined | null,
	outMax?: number | undefined | null,
	stateLossProportional?: number | undefined | null,
	stateMax?: number | undefined | null,
	stateMin?: number | undefined | null,
	initialState?: number | undefined | null,
	isScenarioIndependent?: boolean | undefined | null,
	isTemp?: boolean | undefined | null,
	tEConversion?: number | undefined | null,
	residualValue?: number | undefined | null
};
	["TimeLineUpdate"]: {
		duration?: GraphQLTypes["DurationInput"] | undefined | null,
	step?: GraphQLTypes["DurationInput"] | undefined | null
};
	["ValueInput"]: {
		scenario?: string | undefined | null,
	constant?: number | undefined | null,
	series?: Array<number> | undefined | null
};
	/** Combined date and time (with time zone) in [RFC 3339][0] format.

Represents a description of an exact instant on the time-line (such as the
instant that a user account was created).

[`DateTime` scalar][1] compliant.

See also [`chrono::DateTime`][2] for details.

[0]: https://datatracker.ietf.org/doc/html/rfc3339#section-5
[1]: https://graphql-scalars.dev/docs/scalars/date-time
[2]: https://docs.rs/chrono/latest/chrono/struct.DateTime.html */
["DateTime"]: "scalar" & { name: "DateTime" };
	/** Defines a clock-based start time. */
["ClockChoice"]: {
	__typename: "ClockChoice",
	/** Predefined clock option. */
	choice: GraphQLTypes["Clock"]
};
	["ConFactor"]: {
	__typename: "ConFactor",
	varType: GraphQLTypes["ConstraintFactorType"],
	varTuple: GraphQLTypes["VariableId"],
	data: Array<GraphQLTypes["Value"]>
};
	["Constant"]: {
	__typename: "Constant",
	value: number
};
	["ControlSignal"]: {
	__typename: "ControlSignal",
	name: string,
	signal: Array<number>
};
	/** Represents a user-defined start time. */
["CustomStartTime"]: {
	__typename: "CustomStartTime",
	/** User-provided start time (ISO 8601). */
	startTime: GraphQLTypes["DateTime"]
};
	/** Delay for connections between nodes. */
["Delay"]: {
	__typename: "Delay",
	fromNode: GraphQLTypes["Node"],
	toNode: GraphQLTypes["Node"],
	delay: number,
	minDelayFlow: number,
	maxDelayFlow: number
};
	["Duration"]: {
	__typename: "Duration",
	hours: number,
	minutes: number,
	seconds: number
};
	["ElectricityPriceOutcome"]: {
	__typename: "ElectricityPriceOutcome",
	time: Array<GraphQLTypes["DateTime"]>,
	price: Array<number>
};
	["FloatList"]: {
	__typename: "FloatList",
	values: Array<number>
};
	["Forecast"]: {
	__typename: "Forecast",
	name: string
};
	["ForecastValue"]: {
	__typename: "ForecastValue",
	scenario?: string | undefined | null,
	value: GraphQLTypes["Forecastable"]
};
	["GenConstraint"]: {
	__typename: "GenConstraint",
	name: string,
	gcType: GraphQLTypes["ConstraintType"],
	isSetpoint: boolean,
	penalty: number,
	factors: Array<GraphQLTypes["ConFactor"]>,
	constant: Array<GraphQLTypes["Value"]>
};
	["InflowBlock"]: {
	__typename: "InflowBlock",
	name: string,
	node: GraphQLTypes["Node"],
	data: Array<GraphQLTypes["Value"]>
};
	/** The model itself. */
["InputData"]: {
	__typename: "InputData",
	scenarios: Array<GraphQLTypes["Scenario"]>,
	setup: GraphQLTypes["InputDataSetup"],
	processes: Array<GraphQLTypes["Process"]>,
	nodes: Array<GraphQLTypes["Node"]>,
	nodeDiffusion: Array<GraphQLTypes["NodeDiffusion"]>,
	nodeDelay: Array<GraphQLTypes["Delay"]>,
	nodeHistories: Array<GraphQLTypes["NodeHistory"]>,
	markets: Array<GraphQLTypes["Market"]>,
	nodeGroups: Array<GraphQLTypes["NodeGroup"]>,
	processGroups: Array<GraphQLTypes["ProcessGroup"]>,
	reserveType: Array<GraphQLTypes["ReserveType"]>,
	risk: Array<GraphQLTypes["Risk"]>,
	inflowBlocks: Array<GraphQLTypes["InflowBlock"]>,
	genConstraints: Array<GraphQLTypes["GenConstraint"]>
};
	["InputDataSetup"]: {
	__typename: "InputDataSetup",
	containsReserves: boolean,
	containOnline: boolean,
	containsStates: boolean,
	containsPiecewiseEff: boolean,
	containsRisk: boolean,
	containsDiffusion: boolean,
	containsDelay: boolean,
	containsMarkets: boolean,
	reserveRealisation: boolean,
	useMarketBids: boolean,
	commonTimeSteps: number,
	commonScenario: GraphQLTypes["Scenario"],
	useNodeDummyVariables: boolean,
	useRampDummyVariables: boolean,
	nodeDummyVariableCost: number,
	rampDummyVariableCost: number
};
	["JobStatus"]: {
	__typename: "JobStatus",
	state: GraphQLTypes["JobState"],
	message?: string | undefined | null
};
	["LocationSettings"]: {
	__typename: "LocationSettings",
	/** Country. */
	country: string,
	/** Place within country. */
	place: string
};
	["Market"]: {
	__typename: "Market",
	name: string,
	mType: GraphQLTypes["MarketType"],
	node: GraphQLTypes["Node"],
	processGroup: GraphQLTypes["ProcessGroup"],
	direction?: GraphQLTypes["MarketDirection"] | undefined | null,
	realisation?: number | undefined | null,
	reserveType?: GraphQLTypes["ReserveType"] | undefined | null,
	isBid: boolean,
	isLimited: boolean,
	minBid: number,
	maxBid: number,
	fee: number,
	price: Array<GraphQLTypes["ForecastValue"]>,
	upPrice: Array<GraphQLTypes["ForecastValue"]>,
	downPrice: Array<GraphQLTypes["ForecastValue"]>,
	reserveActivationPrice: Array<GraphQLTypes["Value"]>,
	fixed: Array<GraphQLTypes["MarketFix"]>
};
	["MarketFix"]: {
	__typename: "MarketFix",
	name: string,
	factor: number
};
	["MaybeError"]: {
	__typename: "MaybeError",
	/** Error message; if null, the operation succeeded. */
	message?: string | undefined | null
};
	/** Optimization model. */
["Model"]: {
	__typename: "Model",
	timeLine: GraphQLTypes["TimeLineSettings"],
	inputData: GraphQLTypes["InputData"]
};
	["Mutation"]: {
	__typename: "Mutation",
	/** Start optimization job. Return job ID. */
	startOptimization: number,
	/** Start electricity price fetch job. Return job ID. */
	startElectricityPriceFetch: number,
	/** Start weather forecast job. Return job ID. */
	startWeatherForecastFetch: number,
	/** Update model's time line. */
	updateTimeLine: GraphQLTypes["ValidationErrors"],
	/** Create new scenario. */
	createScenario: GraphQLTypes["MaybeError"],
	/** Delete a scenario and all items that depend on that scenario. */
	deleteScenario: GraphQLTypes["MaybeError"],
	/** Save the model on disk. */
	saveModel: GraphQLTypes["MaybeError"],
	/** Clear input data from model. */
	clearInputData: GraphQLTypes["MaybeError"],
	/** Update input data setup. */
	updateInputDataSetup: GraphQLTypes["ValidationErrors"],
	/** Create new node group */
	createNodeGroup: GraphQLTypes["MaybeError"],
	/** Create new process group. */
	createProcessGroup: GraphQLTypes["MaybeError"],
	deleteGroup: GraphQLTypes["MaybeError"],
	/** Create new process. */
	createProcess: GraphQLTypes["ValidationErrors"],
	/** Add process to process group. */
	addProcessToGroup: GraphQLTypes["MaybeError"],
	/** Delete a process and all items that depend on that process. */
	deleteProcess: GraphQLTypes["MaybeError"],
	/** Create new topology and add it to process. */
	createTopology: GraphQLTypes["ValidationErrors"],
	deleteTopology: GraphQLTypes["MaybeError"],
	/** Create new node. */
	createNode: GraphQLTypes["ValidationErrors"],
	/** Add node to node group. */
	addNodeToGroup: GraphQLTypes["MaybeError"],
	/** Set state for node. Null clears the state. */
	setNodeState: GraphQLTypes["ValidationErrors"],
	/** Update state of a node. The state has to be set. */
	updateNodeState: GraphQLTypes["ValidationErrors"],
	connectNodeInflowToTemperatureForecast: GraphQLTypes["MaybeError"],
	/** Delete a node and all items that depend on that node. */
	deleteNode: GraphQLTypes["MaybeError"],
	/** Create new diffusion between nodes. */
	createNodeDiffusion: GraphQLTypes["ValidationErrors"],
	deleteNodeDiffusion: GraphQLTypes["MaybeError"],
	createNodeDelay: GraphQLTypes["ValidationErrors"],
	deleteNodeDelay: GraphQLTypes["MaybeError"],
	createNodeHistory: GraphQLTypes["ValidationErrors"],
	deleteNodeHistory: GraphQLTypes["MaybeError"],
	addStepToNodeHistory: GraphQLTypes["ValidationErrors"],
	clearNodeHistorySteps: GraphQLTypes["MaybeError"],
	/** Create new market. */
	createMarket: GraphQLTypes["ValidationErrors"],
	/** Connects market's normal, up and down prices to electricity price forecast. */
	connectMarketPricesToForecast: GraphQLTypes["MaybeError"],
	deleteMarket: GraphQLTypes["MaybeError"],
	/** Create new risk. */
	createRisk: GraphQLTypes["ValidationErrors"],
	deleteRisk: GraphQLTypes["MaybeError"],
	/** Create new generic constraint. */
	createGenConstraint: GraphQLTypes["ValidationErrors"],
	deleteGenConstraint: GraphQLTypes["MaybeError"],
	/** Create new flow constraint factor and add it to generic constraint. */
	createFlowConFactor: GraphQLTypes["ValidationErrors"],
	deleteFlowConFactor: GraphQLTypes["MaybeError"],
	/** Create new state constraint factor and add it to generic constraint. */
	createStateConFactor: GraphQLTypes["ValidationErrors"],
	deleteStateConFactor: GraphQLTypes["MaybeError"],
	/** Create new online constraint factor and add it to generic constraint. */
	createOnlineConFactor: GraphQLTypes["ValidationErrors"],
	deleteOnlineConFactor: GraphQLTypes["MaybeError"],
	updateSettings: GraphQLTypes["SettingsResult"]
};
	["Node"]: {
	__typename: "Node",
	name: string,
	groups: Array<GraphQLTypes["NodeGroup"]>,
	isCommodity: boolean,
	isMarket: boolean,
	isRes: boolean,
	state?: GraphQLTypes["State"] | undefined | null,
	cost: Array<GraphQLTypes["Value"]>,
	inflow?: GraphQLTypes["Forecastable"] | undefined | null
};
	["NodeDiffusion"]: {
	__typename: "NodeDiffusion",
	fromNode: GraphQLTypes["Node"],
	toNode: GraphQLTypes["Node"],
	coefficient: Array<GraphQLTypes["Value"]>
};
	["NodeGroup"]: {
	__typename: "NodeGroup",
	name: string,
	members: Array<GraphQLTypes["Node"]>
};
	["NodeHistory"]: {
	__typename: "NodeHistory",
	node: GraphQLTypes["Node"],
	steps: Array<GraphQLTypes["Series"]>
};
	["OptimizationOutcome"]: {
	__typename: "OptimizationOutcome",
	time: Array<GraphQLTypes["DateTime"]>,
	controlSignals: Array<GraphQLTypes["ControlSignal"]>
};
	["Point"]: {
	__typename: "Point",
	x: number,
	y: number
};
	["Process"]: {
	__typename: "Process",
	name: string,
	groups: Array<GraphQLTypes["ProcessGroup"]>,
	conversion: GraphQLTypes["Conversion"],
	isCf: boolean,
	isCfFix: boolean,
	isOnline: boolean,
	isRes: boolean,
	eff: number,
	loadMin: number,
	loadMax: number,
	startCost: number,
	minOnline: number,
	minOffline: number,
	maxOnline: number,
	maxOffline: number,
	isScenarioIndependent: boolean,
	topos: Array<GraphQLTypes["Topology"]>,
	cf: Array<GraphQLTypes["Value"]>,
	effTs: Array<GraphQLTypes["Value"]>,
	effOps: Array<string>,
	effFun: Array<GraphQLTypes["Point"]>
};
	["ProcessGroup"]: {
	__typename: "ProcessGroup",
	name: string,
	members: Array<GraphQLTypes["Process"]>
};
	["Query"]: {
	__typename: "Query",
	settings: GraphQLTypes["Settings"],
	model: GraphQLTypes["Model"],
	genConstraint: GraphQLTypes["GenConstraint"],
	nodeGroup: GraphQLTypes["NodeGroup"],
	nodesInGroup: Array<GraphQLTypes["Node"]>,
	processGroup: GraphQLTypes["ProcessGroup"],
	processesInGroup: Array<GraphQLTypes["Process"]>,
	market: GraphQLTypes["Market"],
	node: GraphQLTypes["Node"],
	/** Return all groups the given node is member of. */
	groupsForNode: Array<GraphQLTypes["NodeGroup"]>,
	nodeDiffusion: GraphQLTypes["NodeDiffusion"],
	/** Return all groups the given process is member of. */
	groupsForProcess: Array<GraphQLTypes["ProcessGroup"]>,
	process: GraphQLTypes["Process"],
	conFactorsForProcess: Array<GraphQLTypes["ConFactor"]>,
	scenario: GraphQLTypes["Scenario"],
	jobStatus: GraphQLTypes["JobStatus"],
	jobOutcome: GraphQLTypes["JobOutcome"]
};
	["ReserveType"]: {
	__typename: "ReserveType",
	name: string,
	rampRate: number
};
	["Risk"]: {
	__typename: "Risk",
	parameter: string,
	value: number
};
	/** Scenario for stochastics. */
["Scenario"]: {
	__typename: "Scenario",
	/** Scenario name. */
	name: string,
	/** Scenario weight. */
	weight: number
};
	["Series"]: {
	__typename: "Series",
	scenario: string,
	durations: Array<GraphQLTypes["Duration"]>,
	values: Array<number>
};
	/** General Hertta settings. */
["Settings"]: {
	__typename: "Settings",
	/** Device location. */
	location?: GraphQLTypes["LocationSettings"] | undefined | null
};
	["State"]: {
	__typename: "State",
	inMax: number,
	outMax: number,
	stateLossProportional: number,
	stateMax: number,
	stateMin: number,
	initialState: number,
	isScenarioIndependent: boolean,
	isTemp: boolean,
	tEConversion: number,
	residualValue: number
};
	/** Optimization time line settings. */
["TimeLineSettings"]: {
	__typename: "TimeLineSettings",
	/** Time line duration. */
	duration: GraphQLTypes["Duration"],
	/** Time step length. */
	step: GraphQLTypes["Duration"],
	/** Start of the time line. */
	start: GraphQLTypes["TimeLineStart"]
};
	["Topology"]: {
	__typename: "Topology",
	source: GraphQLTypes["NodeOrProcess"],
	sink: GraphQLTypes["NodeOrProcess"]
};
	["ValidationError"]: {
	__typename: "ValidationError",
	field: string,
	message: string
};
	["ValidationErrors"]: {
	__typename: "ValidationErrors",
	errors: Array<GraphQLTypes["ValidationError"]>
};
	["Value"]: {
	__typename: "Value",
	scenario?: string | undefined | null,
	value: GraphQLTypes["SeriesValue"]
};
	["VariableId"]: {
	__typename: "VariableId",
	entity: GraphQLTypes["NodeOrProcess"],
	identifier?: GraphQLTypes["Node"] | undefined | null
};
	["WeatherForecastOutcome"]: {
	__typename: "WeatherForecastOutcome",
	time: Array<GraphQLTypes["DateTime"]>,
	temperature: Array<number>
};
	["Forecastable"]:{
        	__typename:"Constant" | "FloatList" | "Forecast"
        	['...on Constant']: '__union' & GraphQLTypes["Constant"];
	['...on FloatList']: '__union' & GraphQLTypes["FloatList"];
	['...on Forecast']: '__union' & GraphQLTypes["Forecast"];
};
	["JobOutcome"]:{
        	__typename:"ElectricityPriceOutcome" | "OptimizationOutcome" | "WeatherForecastOutcome"
        	['...on ElectricityPriceOutcome']: '__union' & GraphQLTypes["ElectricityPriceOutcome"];
	['...on OptimizationOutcome']: '__union' & GraphQLTypes["OptimizationOutcome"];
	['...on WeatherForecastOutcome']: '__union' & GraphQLTypes["WeatherForecastOutcome"];
};
	["NodeOrProcess"]:{
        	__typename:"Node" | "Process"
        	['...on Node']: '__union' & GraphQLTypes["Node"];
	['...on Process']: '__union' & GraphQLTypes["Process"];
};
	["SeriesValue"]:{
        	__typename:"Constant" | "FloatList"
        	['...on Constant']: '__union' & GraphQLTypes["Constant"];
	['...on FloatList']: '__union' & GraphQLTypes["FloatList"];
};
	["SettingsResult"]:{
        	__typename:"Settings" | "ValidationErrors"
        	['...on Settings']: '__union' & GraphQLTypes["Settings"];
	['...on ValidationErrors']: '__union' & GraphQLTypes["ValidationErrors"];
};
	/** Defines the start of the time line. */
["TimeLineStart"]:{
        	__typename:"ClockChoice" | "CustomStartTime"
        	['...on ClockChoice']: '__union' & GraphQLTypes["ClockChoice"];
	['...on CustomStartTime']: '__union' & GraphQLTypes["CustomStartTime"];
}
    }
/** Represents predefined clock options. */
export enum Clock {
	CURRENT_HOUR = "CURRENT_HOUR"
}
export enum ConstraintFactorType {
	FLOW = "FLOW",
	STATE = "STATE",
	ONLINE = "ONLINE"
}
export enum ConstraintType {
	LESS_THAN = "LESS_THAN",
	EQUAL = "EQUAL",
	GREATER_THAN = "GREATER_THAN"
}
export enum Conversion {
	UNIT = "UNIT",
	TRANSPORT = "TRANSPORT",
	MARKET = "MARKET"
}
export enum JobState {
	QUEUED = "QUEUED",
	IN_PROGRESS = "IN_PROGRESS",
	FAILED = "FAILED",
	FINISHED = "FINISHED"
}
export enum MarketDirection {
	UP = "UP",
	DOWN = "DOWN",
	UP_DOWN = "UP_DOWN"
}
export enum MarketType {
	ENERGY = "ENERGY",
	RESERVE = "RESERVE"
}

type ZEUS_VARIABLES = {
	["Clock"]: ValueTypes["Clock"];
	["ConstraintFactorType"]: ValueTypes["ConstraintFactorType"];
	["ConstraintType"]: ValueTypes["ConstraintType"];
	["Conversion"]: ValueTypes["Conversion"];
	["JobState"]: ValueTypes["JobState"];
	["MarketDirection"]: ValueTypes["MarketDirection"];
	["MarketType"]: ValueTypes["MarketType"];
	["DurationInput"]: ValueTypes["DurationInput"];
	["ForecastValueInput"]: ValueTypes["ForecastValueInput"];
	["InputDataSetupUpdate"]: ValueTypes["InputDataSetupUpdate"];
	["LocationInput"]: ValueTypes["LocationInput"];
	["NewGenConstraint"]: ValueTypes["NewGenConstraint"];
	["NewMarket"]: ValueTypes["NewMarket"];
	["NewNode"]: ValueTypes["NewNode"];
	["NewNodeDelay"]: ValueTypes["NewNodeDelay"];
	["NewNodeDiffusion"]: ValueTypes["NewNodeDiffusion"];
	["NewProcess"]: ValueTypes["NewProcess"];
	["NewRisk"]: ValueTypes["NewRisk"];
	["NewSeries"]: ValueTypes["NewSeries"];
	["NewTopology"]: ValueTypes["NewTopology"];
	["SettingsInput"]: ValueTypes["SettingsInput"];
	["StateInput"]: ValueTypes["StateInput"];
	["StateUpdate"]: ValueTypes["StateUpdate"];
	["TimeLineUpdate"]: ValueTypes["TimeLineUpdate"];
	["ValueInput"]: ValueTypes["ValueInput"];
	["DateTime"]: ValueTypes["DateTime"];
}