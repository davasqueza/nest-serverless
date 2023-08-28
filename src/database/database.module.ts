import { DynamicModule } from '@nestjs/common';
import {
  provideSPARQLDatabase,
  SPARQLQueryExecutorToken,
  SPARQLUpdateExecutorToken,
} from './sparql/sparql.provider';
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      global: true,
      providers: provideSPARQLDatabase(),
      exports: [SPARQLQueryExecutorToken, SPARQLUpdateExecutorToken],
    };
  }
}
