import { RecipesRepository } from './recipes.repository';
import { NewRecipeInput } from '../dto/new-recipe.input';
import { Recipe } from '../models/recipe.model';
import { RecipesArgs } from '../dto/recipes.args';
import { SPARQLQueryExecutor } from '../../database/sparql/sparql.type';
import { InjectSPARQLQueryExecutor } from '../../database/sparql/sparql.provider';
import * as sparql from 'rdf-sparql-builder';
import rdf from '@rdfjs/data-model';
export class SparqlRecipesRepository implements RecipesRepository {
  constructor(
    @InjectSPARQLQueryExecutor()
    private queryExecutor: SPARQLQueryExecutor,
  ) {}
  create(data: NewRecipeInput): Promise<Recipe> {
    return Promise.resolve(undefined);
  }

  async findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    const id = rdf.variable('id');
    const title = rdf.variable('title');
    const description = rdf.variable('description');
    const creationDate = rdf.variable('creationDate');
    const ingredients = rdf.variable('ingredients');
    const authorId = rdf.variable('authorId');

    const query = sparql
      .select([id, title, description, creationDate, ingredients, authorId])
      // TODO: Finish query, ingredients using GROUP_CONCAT
      .where()
      .limit(recipesArgs.take * recipesArgs.skip)
      .offset(recipesArgs.take);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => {
      const recipe = new Recipe();
      recipe.id = binding.get('id').value;
      recipe.title = binding.get('title').value;
      recipe.description = binding.get('description').value;
      recipe.creationDate = new Date(binding.get('creationDate').value);
      recipe.ingredients = binding.get('ingredients').value.split(',');
      recipe.authorId = binding.get('authorId').value;

      return recipe;
    });
  }

  findManyByAuthorId(id: string): Promise<Recipe[]> {
    return Promise.resolve([]);
  }

  findOneById(id: string): Promise<Recipe> {
    return Promise.resolve(undefined);
  }

  remove(id: string): Promise<boolean> {
    return Promise.resolve(false);
  }

}
