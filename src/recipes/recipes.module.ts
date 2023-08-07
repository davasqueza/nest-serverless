import { Module } from '@nestjs/common';
import { RecipesResolver } from './recipes.resolver';
import { RecipesService } from './recipes.service';
import { RecipesRepositoryToken } from './repositories/recipes.repository';
import { InMemoryRecipesRepository } from './repositories/in-memory-recipes.repository';

@Module({
  providers: [
    RecipesResolver,
    RecipesService,
    {
      provide: RecipesRepositoryToken,
      useClass: InMemoryRecipesRepository,
    },
  ],
})
export class RecipesModule {}
