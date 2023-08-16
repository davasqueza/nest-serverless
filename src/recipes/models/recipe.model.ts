import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { Author } from '../../author/models/author.model';

@ObjectType({ description: 'recipe ' })
export class Recipe {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  creationDate: Date;

  @Field(() => [String])
  ingredients: string[];

  @HideField()
  authorId: string;

  @Field(() => Author)
  author: Author;
}
