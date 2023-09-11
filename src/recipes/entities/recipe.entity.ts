import rdf from '@rdfjs/data-model';
import { Bindings } from '@comunica/types';
import { Recipe } from '../models/recipe.model';
import { ns } from '../../database/sparql/sparql.const';
import { Term } from '@rdfjs/types';

export class RecipeEntity {
  static recipeNS = ns.dvs.Recipe;
  static recipe = rdf.variable('recipe');
  static id = rdf.variable('id');
  static title = rdf.variable('title');
  static description = rdf.variable('description');
  static creationDate = rdf.variable('creationDate');
  static ingredient = rdf.variable('ingredient');
  static ingredients = rdf.variable('ingredients');
  static authorId = rdf.variable('authorId');
  static author = rdf.variable('author');

  static bindingsToModel(bindings: Bindings): Recipe {
    const recipe = new Recipe();
    recipe.id = bindings.get('id').value;
    recipe.title = bindings.get('title').value;
    recipe.description = bindings.get('description').value;
    recipe.creationDate = new Date(bindings.get('creationDate').value);
    recipe.ingredients = bindings.get('ingredients').value.split('|');
    recipe.authorId = bindings.get('authorId').value;

    return recipe;
  }

  static modelToRDFTerms(
    recipe: Recipe,
  ): Record<keyof Recipe, Term | Term[][]> {
    return {
      id: rdf.literal(recipe.id),
      title: rdf.literal(recipe.title),
      description: rdf.literal(recipe.description),
      creationDate: rdf.literal(recipe.creationDate.toISOString()),
      ingredients: recipe.ingredients.map((ingredient) => [
        ns.dvs[recipe.id],
        ns.dvs.ingredient,
        rdf.literal(ingredient),
      ]),
      authorId: rdf.literal(recipe.authorId),
      author: ns.dvs[recipe.authorId],
    };
  }
}
