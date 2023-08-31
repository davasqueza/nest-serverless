import { RecipesRepository } from './recipes.repository';
import { NewRecipeInput } from '../dto/new-recipe.input';
import { Recipe } from '../models/recipe.model';
import { RecipesArgs } from '../dto/recipes.args';
import {
  SPARQLQueryExecutor,
  SPARQLUpdateExecutor,
} from '../../database/sparql/sparql.type';
import {
  InjectSPARQLQueryExecutor,
  InjectSPARQLUpdateExecutor,
} from '../../database/sparql/sparql.provider';
import * as sparql from 'rdf-sparql-builder';
import rdf from '@rdfjs/data-model';
import { ns } from '../../database/sparql/sparql.const';
import { Bindings } from '@comunica/types';
import { v4 as uuidv4 } from 'uuid';

export class SparqlRecipesRepository implements RecipesRepository {
  constructor(
    @InjectSPARQLQueryExecutor()
    private queryExecutor: SPARQLQueryExecutor,
    @InjectSPARQLUpdateExecutor()
    private updateExecutor: SPARQLUpdateExecutor,
  ) {}

  async create(data: NewRecipeInput): Promise<Recipe> {
    const newRecipe: Recipe = Object.assign(new Recipe(), {
      ...data,
      id: uuidv4(),
      creationDate: new Date(),
    });

    const recipe = ns.dvs[newRecipe.id];
    const id = rdf.literal(newRecipe.id);
    const title = rdf.literal(newRecipe.title);
    const description = rdf.literal(newRecipe.description);
    const creationDate = rdf.literal(newRecipe.creationDate.toISOString());
    const ingredients = newRecipe.ingredients.map((ingredient) => [
      recipe,
      ns.dvs.ingredient,
      rdf.literal(ingredient),
    ]);
    const author = ns.dvs[newRecipe.authorId];

    const query = sparql
      .delete([
        [recipe, ns.rdf.type, ns.dvs.Recipe],
        [recipe, ns.dvs.uuid, id],
        [recipe, ns.dvs.title, title],
        [recipe, ns.dvs.description, description],
        [recipe, ns.dvs.creationDate, creationDate],
        ...ingredients,
        [recipe, ns.dvs.createdBy, author],
        [author, ns.dvs.hasRecipe, id],
      ])
      .toString()
      .replace(/^DELETE {/, 'INSERT DATA {');

    await this.updateExecutor(query);

    return newRecipe;
  }

  async findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    const recipe = rdf.variable('recipe');
    const id = rdf.variable('id');
    const title = rdf.variable('title');
    const description = rdf.variable('description');
    const creationDate = rdf.variable('creationDate');
    const ingredient = rdf.variable('ingredient');
    const author = rdf.variable('author');
    const authorId = rdf.variable('authorId');

    const query = sparql
      .select([
        id,
        title,
        description,
        creationDate,
        '(group_concat(?ingredient ; separator="|") as ?ingredients)',
        authorId,
      ])
      .where([
        [recipe, ns.rdf.type, ns.dvs.Recipe],
        [recipe, ns.dvs.uuid, id],
        [recipe, ns.dvs.title, title],
        [recipe, ns.dvs.description, description],
        [recipe, ns.dvs.creationDate, creationDate],
        [recipe, ns.dvs.ingredient, ingredient],
        [recipe, ns.dvs.createdBy, author],
        [author, ns.dvs.uuid, authorId],
      ])
      .groupBy([id, title, description, creationDate, authorId])
      .limit(recipesArgs.take)
      .offset(recipesArgs.take * recipesArgs.skip);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => this.bindingsToModel(binding));
  }

  async findManyByAuthorId(authorId: string): Promise<Recipe[]> {
    const recipe = rdf.variable('recipe');
    const authorID = rdf.literal(authorId);
    const id = rdf.variable('id');
    const title = rdf.variable('title');
    const description = rdf.variable('description');
    const creationDate = rdf.variable('creationDate');
    const ingredient = rdf.variable('ingredient');
    const author = rdf.variable('author');
    const bindAuthorId = rdf.variable('authorId');

    const query = sparql
      .select([
        id,
        title,
        description,
        creationDate,
        '(group_concat(?ingredient ; separator="|") as ?ingredients)',
        bindAuthorId,
      ])
      .where([
        [recipe, ns.rdf.type, ns.dvs.Recipe],
        [recipe, ns.dvs.uuid, id],
        [recipe, ns.dvs.title, title],
        [recipe, ns.dvs.description, description],
        [recipe, ns.dvs.creationDate, creationDate],
        [recipe, ns.dvs.ingredient, ingredient],
        [recipe, ns.dvs.createdBy, author],
        [author, ns.dvs.uuid, authorID],
        sparql.bind(bindAuthorId, `"${authorId}"`),
      ])
      .groupBy([id, title, description, creationDate, bindAuthorId]);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => this.bindingsToModel(binding));
  }

  async findOneById(recipeId: string): Promise<Recipe> {
    const recipe = rdf.variable('recipe');
    const recipeID = rdf.literal(recipeId);
    const bindRecipeId = rdf.variable('id');
    const title = rdf.variable('title');
    const description = rdf.variable('description');
    const creationDate = rdf.variable('creationDate');
    const ingredient = rdf.variable('ingredient');
    const author = rdf.variable('author');
    const authorId = rdf.variable('authorId');

    const query = sparql
      .select([
        bindRecipeId,
        title,
        description,
        creationDate,
        '(group_concat(?ingredient ; separator="|") as ?ingredients)',
        authorId,
      ])
      .where([
        [recipe, ns.rdf.type, ns.dvs.Recipe],
        [recipe, ns.dvs.uuid, recipeID],
        sparql.bind(bindRecipeId, `"${recipeId}"`),
        [recipe, ns.dvs.title, title],
        [recipe, ns.dvs.description, description],
        [recipe, ns.dvs.creationDate, creationDate],
        [recipe, ns.dvs.ingredient, ingredient],
        [recipe, ns.dvs.createdBy, author],
        [author, ns.dvs.uuid, authorId],
      ])
      .groupBy([bindRecipeId, title, description, creationDate, authorId]);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return this.bindingsToModel(bindings[0]);
  }

  async remove(recipeId: string): Promise<boolean> {
    const recipe = rdf.variable('recipe');
    const recipeID = rdf.literal(recipeId);
    const allProperties = rdf.variable('allProperties');
    const allValues = rdf.variable('allValues');

    const query = sparql.delete().where([
      [recipe, ns.rdf.type, ns.dvs.Recipe],
      [recipe, ns.dvs.uuid, recipeID],
      [recipe, allProperties, allValues],
    ]);

    await this.updateExecutor(query.toString());
    return true;
  }

  private bindingsToModel(binding: Bindings): Recipe {
    const recipe = new Recipe();
    recipe.id = binding.get('id').value;
    recipe.title = binding.get('title').value;
    recipe.description = binding.get('description').value;
    recipe.creationDate = new Date(binding.get('creationDate').value);
    recipe.ingredients = binding.get('ingredients').value.split('|');
    recipe.authorId = binding.get('authorId').value;

    return recipe;
  }
}
