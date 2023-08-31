import { forwardRef, Module } from '@nestjs/common';
import { AuthorResolver } from './author.resolver';
import { AuthorService } from './author.service';
import { AuthorRepositoryToken } from './repositories/author.repository';
import { RecipesModule } from '../recipes/recipes.module';
import { SparqlAuthorRepository } from './repositories/sparql-author.repository';

@Module({
  imports: [forwardRef(() => RecipesModule)],
  providers: [
    AuthorResolver,
    AuthorService,
    {
      provide: AuthorRepositoryToken,
      useClass: SparqlAuthorRepository,
    },
  ],
  exports: [AuthorService],
})
export class AuthorModule {}
