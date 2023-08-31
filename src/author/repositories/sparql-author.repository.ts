import { AuthorRepository } from './author.repository';
import { NewAuthorInput } from '../dto/new-author.input';
import { Author } from '../models/author.model';
import { AuthorArgs } from '../dto/author.args';
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

export class SparqlAuthorRepository implements AuthorRepository {
  constructor(
    @InjectSPARQLQueryExecutor()
    private queryExecutor: SPARQLQueryExecutor,
    @InjectSPARQLUpdateExecutor()
    private updateExecutor: SPARQLUpdateExecutor,
  ) {}

  async create(data: NewAuthorInput): Promise<Author> {
    const newAuthor: Author = Object.assign(new Author(), {
      ...data,
      id: uuidv4(),
    });

    const author = ns.dvs[newAuthor.id];
    const id = rdf.literal(newAuthor.id);
    const name = rdf.literal(newAuthor.name);

    const query = sparql
      .delete([
        [author, ns.rdf.type, ns.dvs.Author],
        [author, ns.dvs.uuid, id],
        [author, ns.dvs.name, name],
      ])
      .toString()
      .replace(/^DELETE {/, 'INSERT DATA {');

    await this.updateExecutor(query);

    return newAuthor;
  }

  async findAll(authorArgs: AuthorArgs): Promise<Author[]> {
    const author = rdf.variable('author');
    const id = rdf.variable('id');
    const name = rdf.variable('name');

    const query = sparql
      .select([id, name])
      .where([
        [author, ns.rdf.type, ns.dvs.Author],
        [author, ns.dvs.uuid, id],
        [author, ns.dvs.name, name],
      ])
      .limit(authorArgs.take)
      .offset(authorArgs.take * authorArgs.skip);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => this.bindingsToModel(binding));
  }

  async findOneById(authorId: string): Promise<Author> {
    const author = rdf.variable('author');
    const authorID = rdf.literal(authorId);
    const bindAuthorId = rdf.variable('id');
    const name = rdf.variable('name');

    const query = sparql
      .select([bindAuthorId, name])
      .where([
        [author, ns.rdf.type, ns.dvs.Author],
        [author, ns.dvs.uuid, authorID],
        sparql.bind(bindAuthorId, `"${authorId}"`),
        [author, ns.dvs.name, name],
      ]);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return this.bindingsToModel(bindings[0]);
  }

  async remove(authorId: string): Promise<boolean> {
    const author = rdf.variable('author');
    const authorID = rdf.literal(authorId);
    const allProperties = rdf.variable('allProperties');
    const allValues = rdf.variable('allValues');

    const query = sparql.delete().where([
      [author, ns.rdf.type, ns.dvs.Author],
      [author, ns.dvs.uuid, authorID],
      [author, allProperties, allValues],
    ]);

    await this.updateExecutor(query.toString());
    return true;
  }

  private bindingsToModel(binding: Bindings): Author {
    const author = new Author();
    author.id = binding.get('id').value;
    author.name = binding.get('name').value;

    return author;
  }
}
