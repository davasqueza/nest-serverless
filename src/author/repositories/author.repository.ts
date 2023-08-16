import { Inject } from '@nestjs/common';
import { NewAuthorInput } from '../dto/new-author.input';
import { Author } from '../models/author.model';
import { AuthorArgs } from '../dto/author.args';

export interface AuthorRepository {
  create(data: NewAuthorInput): Promise<Author>;
  findOneById(id: string): Promise<Author>;
  findAll(recipesArgs: AuthorArgs): Promise<Author[]>;
  remove(id: string): Promise<boolean>;
}

export const AuthorRepositoryToken = Symbol('AuthorRepository');

export function InjectAuthorRepository() {
  return Inject(AuthorRepositoryToken);
}
