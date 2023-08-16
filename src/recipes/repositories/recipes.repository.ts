import { Inject } from '@nestjs/common';
import { NewRecipeInput } from '../dto/new-recipe.input';
import { Recipe } from '../models/recipe.model';
import { RecipesArgs } from '../dto/recipes.args';

export interface RecipesRepository {
  create(data: NewRecipeInput): Promise<Recipe>;
  findOneById(id: string): Promise<Recipe>;
  findManyByAuthorId(id: string): Promise<Recipe[]>;
  findAll(recipesArgs: RecipesArgs): Promise<Recipe[]>;
  remove(id: string): Promise<boolean>;
}

export const RecipesRepositoryToken = Symbol('RecipesRepository');

export function InjectRecipesRepository() {
  return Inject(RecipesRepositoryToken);
}
