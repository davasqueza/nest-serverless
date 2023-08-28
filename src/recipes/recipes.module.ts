import { forwardRef, Module } from '@nestjs/common';
import { RecipesResolver } from './recipes.resolver';
import { RecipesService } from './recipes.service';
import { RecipesRepositoryToken } from './repositories/recipes.repository';
import { AuthorModule } from '../author/author.module';
import { SparqlRecipesRepository } from './repositories/sparql-recipes.repository';

@Module({
  imports: [forwardRef(() => AuthorModule)],
  providers: [
    RecipesResolver,
    RecipesService,
    {
      provide: RecipesRepositoryToken,
      useClass: SparqlRecipesRepository,
    },
  ],
  exports: [RecipesService],
})
export class RecipesModule {}
