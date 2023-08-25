import { Inject, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryEngine } from '@comunica/query-sparql';
import { Context, Query } from './sparql.type';

export const SPARQLQueryExecutorToken = Symbol('SPARQLQueryExecutor');
export function InjectSPARQLQueryExecutor() {
  return Inject(SPARQLQueryExecutorToken);
}
export function provideSPARQLDatabase(): Provider {
  return {
    provide: SPARQLQueryExecutorToken,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const recipesEndpoint = configService.get<string>('RECIPES_ENDPOINT');
      const queryEngine = new QueryEngine();

      return (query: Query, context?: Context) => {
        const defaultContext: Context = {
          ...context,
          sources: [recipesEndpoint],
        };

        return queryEngine.queryBindings(query, defaultContext);
      };
    },
  };
}
