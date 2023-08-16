import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NewAuthorInput } from './dto/new-author.input';
import { AuthorArgs } from './dto/author.args';
import { Author } from './models/author.model';
import { AuthorService } from './author.service';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => Author, { name: 'author' })
  async getAuthorById(@Args('id') id: string): Promise<Author> {
    const author = await this.authorService.findOneById(id);
    if (!author) {
      throw new NotFoundException(id);
    }
    return author;
  }

  @Query(() => [Author], { name: 'authors' })
  getAllAuthors(@Args() authorsArgs: AuthorArgs): Promise<Author[]> {
    return this.authorService.findAll(authorsArgs);
  }

  @Mutation(() => Author)
  async addAuthor(
    @Args('newAuthorData') newAuthorData: NewAuthorInput,
  ): Promise<Author> {
    return this.authorService.create(newAuthorData);
  }

  @Mutation(() => Boolean)
  async removeAuthor(@Args('id') id: string) {
    return this.authorService.remove(id);
  }
}
