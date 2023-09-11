import { ns } from '../../database/sparql/sparql.const';
import rdf from '@rdfjs/data-model';
import { Bindings } from '@comunica/types';
import { Author } from '../models/author.model';
import { Term } from '@rdfjs/types';

export class AuthorEntity {
  static authorNS = ns.dvs.Author;
  static author = rdf.variable('author');
  static id = rdf.variable('id');
  static fullName = rdf.variable('name');

  static bindingsToModel(bindings: Bindings): Author {
    const author = new Author();
    author.id = bindings.get('id').value;
    author.name = bindings.get('name').value;

    return author;
  }

  static modelToRDFTerms(
    author: Author,
  ): Record<keyof Author, Term | Term[][]> {
    return {
      id: rdf.literal(author.id),
      name: rdf.literal(author.name),
      recipes: ns.dvs.hasRecipe,
    };
  }
}
