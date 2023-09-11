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
import { v4 as uuidv4 } from 'uuid';
import { RecipeEntity } from '../entities/recipe.entity';
import { Term } from '@rdfjs/types';

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

    const recipeIRI = ns.dvs[newRecipe.id];
    const recipeEntity = RecipeEntity.modelToRDFTerms(newRecipe);

    const query = sparql
      .delete([
        [recipeIRI, ns.rdf.type, RecipeEntity.recipeNS],
        [recipeIRI, ns.dvs.uuid, recipeEntity.id],
        [recipeIRI, ns.dvs.title, recipeEntity.title],
        [recipeIRI, ns.dvs.description, recipeEntity.description],
        [recipeIRI, ns.dvs.creationDate, recipeEntity.creationDate],
        ...(recipeEntity.ingredients as Term[][]),
        [recipeIRI, ns.dvs.createdBy, recipeEntity.author],
        [recipeEntity.author, ns.dvs.hasRecipe, recipeEntity.id],
      ])
      .toString()
      .replace(/^DELETE {/, 'INSERT DATA {');

    await this.updateExecutor(query);

    return newRecipe;
  }

  async findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    const query = sparql
      .select([
        RecipeEntity.id,
        RecipeEntity.title,
        RecipeEntity.description,
        RecipeEntity.creationDate,
        '(group_concat(?ingredient ; separator="|") as ?ingredients)',
        RecipeEntity.authorId,
      ])
      .where([
        [RecipeEntity.recipe, ns.rdf.type, RecipeEntity.recipeNS],
        [RecipeEntity.recipe, ns.dvs.uuid, RecipeEntity.id],
        [RecipeEntity.recipe, ns.dvs.title, RecipeEntity.title],
        [RecipeEntity.recipe, ns.dvs.description, RecipeEntity.description],
        [RecipeEntity.recipe, ns.dvs.creationDate, RecipeEntity.creationDate],
        [RecipeEntity.recipe, ns.dvs.ingredient, RecipeEntity.ingredient],
        [RecipeEntity.recipe, ns.dvs.createdBy, RecipeEntity.author],
        [RecipeEntity.author, ns.dvs.uuid, RecipeEntity.authorId],
      ])
      .groupBy([
        RecipeEntity.id,
        RecipeEntity.title,
        RecipeEntity.description,
        RecipeEntity.creationDate,
        RecipeEntity.authorId,
      ])
      .limit(recipesArgs.take)
      .offset(recipesArgs.take * recipesArgs.skip);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => RecipeEntity.bindingsToModel(binding));
  }

  async findManyByAuthorId(authorId: string): Promise<Recipe[]> {
    const query = sparql
      .select([
        RecipeEntity.id,
        RecipeEntity.title,
        RecipeEntity.description,
        RecipeEntity.creationDate,
        '(group_concat(?ingredient ; separator="|") as ?ingredients)',
        RecipeEntity.authorId,
      ])
      .where([
        [RecipeEntity.recipe, ns.rdf.type, RecipeEntity.recipeNS],
        [RecipeEntity.recipe, ns.dvs.uuid, RecipeEntity.id],
        [RecipeEntity.recipe, ns.dvs.title, RecipeEntity.title],
        [RecipeEntity.recipe, ns.dvs.description, RecipeEntity.description],
        [RecipeEntity.recipe, ns.dvs.creationDate, RecipeEntity.creationDate],
        [RecipeEntity.recipe, ns.dvs.ingredient, RecipeEntity.ingredient],
        [RecipeEntity.recipe, ns.dvs.createdBy, RecipeEntity.author],
        [RecipeEntity.author, ns.dvs.uuid, rdf.literal(authorId)],
        sparql.bind(RecipeEntity.authorId, `"${authorId}"`),
      ])
      .groupBy([
        RecipeEntity.id,
        RecipeEntity.title,
        RecipeEntity.description,
        RecipeEntity.creationDate,
        RecipeEntity.authorId,
      ]);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => RecipeEntity.bindingsToModel(binding));
  }

  async findOneById(recipeId: string): Promise<Recipe> {
    const query = sparql
      .select([
        RecipeEntity.id,
        RecipeEntity.title,
        RecipeEntity.description,
        RecipeEntity.creationDate,
        '(group_concat(?ingredient ; separator="|") as ?ingredients)',
        RecipeEntity.authorId,
      ])
      .where([
        [RecipeEntity.recipe, ns.rdf.type, RecipeEntity.recipeNS],
        [RecipeEntity.recipe, ns.dvs.uuid, rdf.literal(recipeId)],
        sparql.bind(RecipeEntity.id, `"${recipeId}"`),
        [RecipeEntity.recipe, ns.dvs.title, RecipeEntity.title],
        [RecipeEntity.recipe, ns.dvs.description, RecipeEntity.description],
        [RecipeEntity.recipe, ns.dvs.creationDate, RecipeEntity.creationDate],
        [RecipeEntity.recipe, ns.dvs.ingredient, RecipeEntity.ingredient],
        [RecipeEntity.recipe, ns.dvs.createdBy, RecipeEntity.author],
        [RecipeEntity.author, ns.dvs.uuid, RecipeEntity.authorId],
      ])
      .groupBy([
        RecipeEntity.id,
        RecipeEntity.title,
        RecipeEntity.description,
        RecipeEntity.creationDate,
        RecipeEntity.authorId,
      ]);

    const bindingsStream = await this.queryExecutor(query.toString());
    const [bindings] = await bindingsStream.toArray();

    return RecipeEntity.bindingsToModel(bindings);
  }

  async remove(recipeId: string): Promise<boolean> {
    const allProperties = rdf.variable('allProperties');
    const allValues = rdf.variable('allValues');

    const query = sparql.delete().where([
      [RecipeEntity.recipe, ns.rdf.type, RecipeEntity.recipeNS],
      [RecipeEntity.recipe, ns.dvs.uuid, rdf.literal(recipeId)],
      [RecipeEntity.recipe, allProperties, allValues],
    ]);

    await this.updateExecutor(query.toString());
    return true;
  }
}
