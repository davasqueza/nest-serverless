import { RecipesRepository } from './recipes.repository';
import { NewRecipeInput } from '../dto/new-recipe.input';
import { Recipe } from '../models/recipe.model';
import { RecipesArgs } from '../dto/recipes.args';
import { SPARQLQueryExecutor } from '../../database/sparql/sparql.type';
import { InjectSPARQLQueryExecutor } from '../../database/sparql/sparql.provider';
import * as sparql from 'rdf-sparql-builder';
import { Func } from 'rdf-sparql-builder/lib/Func';
import { Aggregate } from 'rdf-sparql-builder/lib/Aggregate';
import rdf from '@rdfjs/data-model';
import { ns } from '../../database/sparql/sparql.const';
export class SparqlRecipesRepository implements RecipesRepository {
  constructor(
    @InjectSPARQLQueryExecutor()
    private queryExecutor: SPARQLQueryExecutor,
  ) {}
  create(data: NewRecipeInput): Promise<Recipe> {
    return Promise.resolve(undefined);
  }

  async findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    const recipe = rdf.variable('recipe');
    const id = rdf.variable('id');
    const title = rdf.variable('title');
    const description = rdf.variable('description');
    const creationDate = rdf.variable('creationDate');
    const ingredient = rdf.variable('ingredient');
    const ingredientList = rdf.variable('ingredientList');
    const author = rdf.variable('author');
    const authorId = rdf.variable('authorId');
    const groupConcat = (as, ...args) =>
      new Aggregate('', new Func('GROUP_CONCAT', args), as);

    const query = sparql
      .select([
        id,
        title,
        description,
        creationDate,
        groupConcat(ingredientList, ingredient, 'separator=","'),
        authorId,
      ])
      .where([
        [recipe, ns.a, ns.dvs.Recipe],
        [recipe, ns.dvs.uuid, id],
        [recipe, ns.dvs.title, title],
        [recipe, ns.dvs.description, description],
        [recipe, ns.dvs.creationDate, creationDate],

        [recipe, ns.dvs.ingredient, ingredient],

        [recipe, ns.dvs.createdBy, author],
        [author, ns.dvs.uuid, authorId],
      ])
      .groupBy(id)
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
