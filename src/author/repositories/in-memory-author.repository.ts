import { AuthorRepository } from './author.repository';
import { Author } from '../models/author.model';
import { NewAuthorInput } from '../dto/new-author.input';
import { v4 as uuidv4 } from 'uuid';
import { AuthorArgs } from '../dto/author.args';

export class InMemoryAuthorRepository implements AuthorRepository {
  private author: Map<string, Author> = new Map();

  async create(data: NewAuthorInput): Promise<Author> {
    const newAuthor = Object.assign(new Author(), data);
    newAuthor.id = uuidv4();

    this.author.set(newAuthor.id, newAuthor);
    return newAuthor;
  }

  async findOneById(id: string): Promise<Author> {
    return this.author.get(id);
  }

  async findAll(authorArgs: AuthorArgs): Promise<Author[]> {
    const list = Array.from(this.author.values());
    return list.slice(authorArgs.skip, authorArgs.take + list.length);
  }

  async remove(id: string): Promise<boolean> {
    return this.author.delete(id);
  }
}
