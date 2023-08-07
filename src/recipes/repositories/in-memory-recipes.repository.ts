import { RecipesRepository } from './recipes.repository';
import { Recipe } from '../models/recipe.model';
import { NewRecipeInput } from '../dto/new-recipe.input';
import { v4 as uuidv4 } from 'uuid';
import { RecipesArgs } from '../dto/recipes.args';

export class InMemoryRecipesRepository implements RecipesRepository {
  private recipes: Map<string, Recipe> = new Map();

  async create(data: NewRecipeInput): Promise<Recipe> {
    const newRecipe = Object.assign(new Recipe(), data);
    newRecipe.creationDate = new Date();
    newRecipe.id = uuidv4();

    this.recipes.set(newRecipe.id, newRecipe);
    return newRecipe;
  }

  async findOneById(id: string): Promise<Recipe> {
    return this.recipes.get(id);
  }

  async findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    const list = Array.from(this.recipes.values());
    return list.slice(recipesArgs.skip, recipesArgs.take + list.length);
  }

  async remove(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }
}
