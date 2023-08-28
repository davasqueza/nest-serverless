import { Inject, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryEngine } from '@comunica/query-sparql';
import { Context, Query } from './sparql.type';

export const SPARQLQueryExecutorToken = Symbol('SPARQLQueryExecutor');
export function InjectSPARQLQueryExecutor() {
  return Inject(SPARQLQueryExecutorToken);
}

export const SPARQLUpdateExecutorToken = Symbol('SPARQLUpdateExecutor');
export function InjectSPARQLUpdateExecutor() {
  return Inject(SPARQLUpdateExecutorToken);
}
export function provideSPARQLDatabase(): Provider[] {
  return [generateReadProvider(), generateWriteProvider()];
}

function generateReadProvider(): Provider {
  return {
    provide: SPARQLQueryExecutorToken,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const recipesEndpoint = configService.get<string>(
        'RECIPES_SPARQL_READ_ENDPOINT',
      );
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

function generateWriteProvider(): Provider {
  return {
    provide: SPARQLUpdateExecutorToken,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const recipesEndpoint = configService.get<string>(
        'RECIPES_SPARQL_WRITE_ENDPOINT',
      );
      const queryEngine = new QueryEngine();

      return (query: Query, context?: Context) => {
        const defaultContext: Context = {
          ...context,
          sources: [recipesEndpoint],
        };

        return queryEngine.queryVoid(query, defaultContext);
      };
    },
  };
}
