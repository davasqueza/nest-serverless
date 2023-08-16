import { forwardRef, Module } from '@nestjs/common';
import { AuthorResolver } from './author.resolver';
import { AuthorService } from './author.service';
import { AuthorRepositoryToken } from './repositories/author.repository';
import { InMemoryAuthorRepository } from './repositories/in-memory-author.repository';
import { RecipesModule } from '../recipes/recipes.module';

@Module({
  imports: [forwardRef(() => RecipesModule)],
  providers: [
    AuthorResolver,
    AuthorService,
    {
      provide: AuthorRepositoryToken,
      // TODO: Implement a neptune repository using N3: https://github.com/rdfjs/N3.js
      useClass: InMemoryAuthorRepository,
    },
  ],
  exports: [AuthorService],
})
export class AuthorModule {}
