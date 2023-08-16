import { Injectable } from '@nestjs/common';
import { NewAuthorInput } from './dto/new-author.input';
import { Author } from './models/author.model';
import { AuthorArgs } from './dto/author.args';
import {
  AuthorRepository,
  InjectAuthorRepository,
} from './repositories/author.repository';

@Injectable()
export class AuthorService {
  constructor(
    @InjectAuthorRepository()
    private authorRepository: AuthorRepository,
  ) {}

  create(data: NewAuthorInput): Promise<Author> {
    return this.authorRepository.create(data);
  }

  findOneById(id: string): Promise<Author> {
    return this.authorRepository.findOneById(id);
  }

  findAll(authorArgs: AuthorArgs): Promise<Author[]> {
    return this.authorRepository.findAll(authorArgs);
  }

  remove(id: string): Promise<boolean> {
    return this.authorRepository.remove(id);
  }
}
