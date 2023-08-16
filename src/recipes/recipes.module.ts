import { Module } from '@nestjs/common';
import { RecipesResolver } from './recipes.resolver';
import { RecipesService } from './recipes.service';
import { RecipesRepositoryToken } from './repositories/recipes.repository';
import { InMemoryRecipesRepository } from './repositories/in-memory-recipes.repository';
import { AuthorModule } from '../author/author.module';

@Module({
  imports: [AuthorModule],
  providers: [
    RecipesResolver,
    RecipesService,
    {
      provide: RecipesRepositoryToken,
      // TODO: Implement a neptune repository using N3: https://github.com/rdfjs/N3.js
      useClass: InMemoryRecipesRepository,
    },
  ],
})
export class RecipesModule {}
