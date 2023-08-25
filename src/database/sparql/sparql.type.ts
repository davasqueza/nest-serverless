import { QueryEngineBase } from '@comunica/actor-init-query/lib/QueryEngineBase';
import { BindingsStream } from '@comunica/types/lib';

export type QueryBindingsParameters = Parameters<
  QueryEngineBase['queryBindings']
>;

export type Query = QueryBindingsParameters[0];
export type Context = QueryBindingsParameters[1];
export type SPARQLQueryExecutor = (
  query: Query,
  context?: Context,
) => Promise<BindingsStream>;
