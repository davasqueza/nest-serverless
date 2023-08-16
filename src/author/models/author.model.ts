import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Recipe } from '../../recipes/models/recipe.model';

@ObjectType({ description: 'author ' })
export class Author {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [Recipe])
  recipes: Recipe[];
}
