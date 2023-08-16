import { NotFoundException } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';
import { RecipesService } from './recipes.service';
import { Author } from '../author/models/author.model';
import { AuthorService } from '../author/author.service';

@Resolver(() => Recipe)
export class RecipesResolver {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly authorService: AuthorService,
  ) {}

  @Query(() => Recipe, { name: 'recipe' })
  async getRecipeById(@Args('id') id: string): Promise<Recipe> {
    const recipe = await this.recipesService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query(() => [Recipe], { name: 'recipes' })
  getAllRecipes(@Args() recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return this.recipesService.findAll(recipesArgs);
  }

  @Mutation(() => Recipe)
  async addRecipe(
    @Args('newRecipeData') newRecipeData: NewRecipeInput,
  ): Promise<Recipe> {
    return this.recipesService.create(newRecipeData);
  }

  @Mutation(() => Boolean)
  async removeRecipe(@Args('id') id: string) {
    return this.recipesService.remove(id);
  }
  @ResolveField('author', () => Author)
  async getAuthor(@Parent() recipe: Recipe) {
    return this.authorService.findOneById(recipe.authorId);
  }
}
