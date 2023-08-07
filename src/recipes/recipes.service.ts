import { Injectable } from '@nestjs/common';
import { NewRecipeInput } from './dto/new-recipe.input';
import { Recipe } from './models/recipe.model';
import { RecipesArgs } from './dto/recipes.args';
import { InjectRecipesRepository } from './repositories/recipes.repository';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRecipesRepository()
    private recipesRepository,
  ) {}

  create(data: NewRecipeInput): Promise<Recipe> {
    return this.recipesRepository.create(data);
  }

  findOneById(id: string): Promise<Recipe> {
    return this.recipesRepository.findOneById(id);
  }

  findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return this.recipesRepository.findAll(recipesArgs);
  }

  remove(id: string): Promise<boolean> {
    return this.recipesRepository.remove(id);
  }
}
