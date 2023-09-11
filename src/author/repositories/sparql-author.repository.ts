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
import { v4 as uuidv4 } from 'uuid';
import { AuthorEntity } from '../entities/author.entity';

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

    const authorIRI = ns.dvs[newAuthor.id];
    const authorEntity = AuthorEntity.modelToRDFTerms(newAuthor);

    const query = sparql
      .delete([
        [authorIRI, ns.rdf.type, AuthorEntity.authorNS],
        [authorIRI, ns.dvs.uuid, authorEntity.id],
        [authorIRI, ns.dvs.name, authorEntity.name],
      ])
      .toString()
      .replace(/^DELETE {/, 'INSERT DATA {');

    await this.updateExecutor(query);

    return newAuthor;
  }

  async findAll(authorArgs: AuthorArgs): Promise<Author[]> {
    const query = sparql
      .select([AuthorEntity.id, AuthorEntity.fullName])
      .where([
        [AuthorEntity.author, ns.rdf.type, AuthorEntity.authorNS],
        [AuthorEntity.author, ns.dvs.uuid, AuthorEntity.id],
        [AuthorEntity.author, ns.dvs.name, AuthorEntity.fullName],
      ])
      .limit(authorArgs.take)
      .offset(authorArgs.take * authorArgs.skip);

    const bindingsStream = await this.queryExecutor(query.toString());
    const bindings = await bindingsStream.toArray();

    return bindings.map((binding) => AuthorEntity.bindingsToModel(binding));
  }

  async findOneById(authorId: string): Promise<Author> {
    const query = sparql
      .select([AuthorEntity.id, AuthorEntity.fullName])
      .where([
        [AuthorEntity.author, ns.rdf.type, AuthorEntity.authorNS],
        [AuthorEntity.author, ns.dvs.uuid, rdf.literal(authorId)],
        sparql.bind(AuthorEntity.id, `"${authorId}"`),
        [AuthorEntity.author, ns.dvs.name, AuthorEntity.fullName],
      ]);

    const bindingsStream = await this.queryExecutor(query.toString());
    const [bindings] = await bindingsStream.toArray();

    return AuthorEntity.bindingsToModel(bindings);
  }

  async remove(authorId: string): Promise<boolean> {
    const allProperties = rdf.variable('allProperties');
    const allValues = rdf.variable('allValues');

    const query = sparql.delete().where([
      [AuthorEntity.author, ns.rdf.type, AuthorEntity.authorNS],
      [AuthorEntity.author, ns.dvs.uuid, rdf.literal(authorId)],
      [AuthorEntity.author, allProperties, allValues],
    ]);

    await this.updateExecutor(query.toString());
    return true;
  }
}
